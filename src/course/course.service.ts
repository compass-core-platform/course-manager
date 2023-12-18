import { NotFoundException, BadRequestException, Injectable, NotAcceptableException, HttpException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { FeedbackDto } from "./dto/feedback.dto";
import { AddCourseDto } from "./dto/add-course.dto";
import { CourseProgressStatus, CourseStatus, CourseVerificationStatus } from "@prisma/client";
import { CompleteCourseDto } from "./dto/completion.dto";
import { EditCourseDto } from "./dto/edit-course.dto";
import { AdminCourseResponse, CourseResponse, ProviderCourseResponse } from "src/course/dto/course-response.dto";
import { CourseTransactionDto } from "./dto/transaction.dto";
import { SearchResponseDTO } from "./dto/search-response.dto";
import { CourseStatusDto } from "./dto/course-status.dto";
import axios from "axios";
import { uploadFile } from "src/utils/minio";
import { ProviderProfileResponse } from "src/provider/dto/provider-profile-response.dto";
import { PurchaseResponseDto } from "./dto/purchase.dto";

@Injectable()
export class CourseService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async searchCourses(searchInput: string): Promise<CourseResponse[]> {

        // Searches for the courses available in the DB that match or contain the input search string
        // in their title, author, description or competency
        let courses = await this.prisma.course.findMany({
            where: {
                OR: [{
                    title: {
                        contains: searchInput,
                        mode: "insensitive",
                    }
                }, {
                    author: {
                        contains: searchInput,
                        mode: "insensitive",
                    }
                }, {
                    description: {
                        contains: searchInput,
                        mode: "insensitive",
                    }
                }, {
                    competency: { 
                        path: [searchInput.toLowerCase()],
                        not: "null",
                    }
                }, {
                    competency: { 
                        path: [searchInput],
                        not: "null",
                    }
                }
            ]
            },
            include: {
                provider: {
                    select: {
                        orgName: true,
                    }
                },
                _count: {
                    select: {
                        userCourses: true
                    }
                }
            }
        });
        // Filter out the courses that are not accepted, archived or not available
        courses = courses.filter((c) => 
            c.verificationStatus == CourseVerificationStatus.ACCEPTED 
            && c.status == CourseStatus.UNARCHIVED
            && (c.startDate ? c.startDate <= new Date(): true)
            && (c.endDate ? c.endDate >= new Date(): true)
        );
        return courses.map((c) => {
            let {cqfScore, impactScore, verificationStatus, rejectionReason, provider, _count, competency, courseLink, ...clone} = c;
            const courseResponse: CourseResponse = {
                ...clone,
                providerName: provider.orgName,
                numOfUsers: _count.userCourses,
                competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
            }
            return courseResponse;
        });
    }

    async addCourse(addCourseDto: AddCourseDto, provider: ProviderProfileResponse,  image: Express.Multer.File) {

        const imageName = addCourseDto.title.replaceAll(" ", "_")
        const imageLink = await uploadFile( `provider/${provider.orgName.replaceAll(" ", "_")}/${imageName}`, image.buffer);

        
        // add new course to the platform
        return await this.prisma.course.create({
            data: {
                providerId: provider.id,
                ...addCourseDto,
                imageLink,
            }
        });
    }

    async addPurchaseRecord(courseId: string, consumerId: string): Promise<PurchaseResponseDto> {

        // Validate course
        const course = await this.getCourse(courseId);

        if(course.verificationStatus != CourseVerificationStatus.ACCEPTED)
            throw new BadRequestException("Course is not accepted");
        if(course.status == CourseStatus.ARCHIVED)
            throw new BadRequestException("Course is archived");
        if((course.startDate && course.startDate > new Date()) || (course.endDate && course.endDate < new Date()))
            throw new BadRequestException("Course is not available at the moment");
        
        // Check if course already purchased
        const record = await this.prisma.userCourse.findFirst({
            where: { userId: consumerId, courseId: courseId }
        });
        if(record != null)
            throw new BadRequestException("Course already purchased by the user");


        // create new record for purchase
        await this.prisma.userCourse.create({
            data: {
                userId: consumerId,
                courseId,
            }
        });
        return {
            courseLink: course.courseLink
        }
    }

    async changeStatus(courseId: string, providerId: string, courseStatusDto: CourseStatusDto) {

        // Validate course
        const course = await this.getCourse(courseId)

        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to the provider");

        // update the course status to archived
        return this.prisma.course.update({
            where: { courseId, providerId },
            data: { status: courseStatusDto.status }
        });
    }

    async editCourse(courseId: string, editCourseDto: EditCourseDto, provider: ProviderProfileResponse, image?: Express.Multer.File) {

        // Validate course
        const course = await this.getCourse(courseId);
        let imgUrl = course.imageLink;
        if(image) {
            const imageName = (editCourseDto.title ?? course.title).replaceAll(" ", "_")
            imgUrl = await uploadFile( `provider/${provider.orgName.replaceAll(" ", "_")}/${imageName}`, image.buffer);
        }

        // update the course details as required and change its verification status to pending
        return this.prisma.course.update({
            where: { courseId },
            data: {
                ...editCourseDto,
                verificationStatus: CourseVerificationStatus.PENDING,
                imageLink: imgUrl
            }
        });
    }

    async getCourse(courseId: string): Promise<AdminCourseResponse> {

        // Find course by ID and throw error if not found
        const course = await this.prisma.course.findUnique({
            where: {
                courseId
            },
            include: {
                provider: {
                    select: {
                        orgName: true,
                        orgLogo: true
                    }
                }
            }
        })
        if(!course)
            throw new NotFoundException("Course does not exist");

        // let courseResponse: AdminCourseResponse
        const { provider, competency, ...courseResponse } = course;
        return {
            ...courseResponse,
            competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
            providerName: provider.orgName,
            providerLogo: provider.orgLogo
        }
    }

    async getNumOfCourseUsers(courseId: string) {

        return this.prisma.userCourse.count({
            where: {
                courseId
            }
        })
    }

    async getCourseByConsumer(courseId: string): Promise<CourseResponse> {

        // Find course by ID and throw error if not found
        const course = await this.getCourse(courseId);
        const numOfUsers = await this.getNumOfCourseUsers(courseId);

        if(course.verificationStatus != CourseVerificationStatus.ACCEPTED)
            throw new BadRequestException("Course is not accepted");
        if(course.status != CourseStatus.UNARCHIVED)
            throw new BadRequestException("Course is archived");
        if((course.startDate && course.startDate > new Date()) || (course.endDate && course.endDate < new Date()))
            throw new BadRequestException("Course is not available at the moment");
        
        const {cqfScore, impactScore, verificationStatus, rejectionReason, courseLink, ...clone} = course;
        return {
            ...clone,
            numOfUsers
        }
    }

    async giveCourseFeedback(courseId: string, userId: string, feedbackDto: FeedbackDto) {

        // Validate course
        const course = await this.getCourse(courseId);

        // Find purchase record with consumer Id and course ID and throw error if not found
        // Or if course not complete
        const userCourse = await this.prisma.userCourse.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: courseId
                }
            },
        });
        if(!userCourse)
            throw new NotFoundException("This user has not subscribed to this course");
        
        if(userCourse.status != CourseProgressStatus.COMPLETED)
            throw new BadRequestException("Course not complete");
        
        // Add feedback
        await this.prisma.userCourse.update({
            where: {
                userId_courseId: {
                    courseId,
                    userId
                }
            },
            data: {
                ...feedbackDto
            }
        });

        // Change average rating of the course
        const avgRating = await this.prisma.userCourse.aggregate({
            where: {
                courseId
            },
            _avg: {
                rating: true
            }
        });
        await this.prisma.course.update({
            where: {
                courseId
            },
            data: {
                avgRating: avgRating._avg.rating
            }
        });
    }

    async deleteCourse(courseId: string) {
        
        // Delete the course entry from db
        await this.prisma.course.delete({
            where: {
                courseId
            }
        })
    }

    async getProviderCourses(providerId: string): Promise<ProviderCourseResponse[]> {

        // Get all courses added by a single provider
        const courses = await this.prisma.course.findMany({
            where: {
                providerId
            }
        })
        return courses.map((c) => {
            const {cqfScore, impactScore, competency, ...clone} = c;
            return {
                ...clone,
                competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
            }
        })
    }

    async getPurchasedUsersByCourseId(courseId: string) {

        // Get all users that have bought a course
        return this.prisma.userCourse.findMany({
            where: {
                courseId
            },
        })
    }

    async markCourseComplete(completeCourseDto: CompleteCourseDto) {

        // Validate course
        const userCourse = await this.prisma.userCourse.findUnique({
            where: {
                userId_courseId: {
                    userId: completeCourseDto.userId,
                    courseId: completeCourseDto.courseId
                }
            },
            include: {
                course: {
                    select: {
                        title: true,
                        courseLink: true,
                        provider: {
                            select: {
                                orgName: true
                            }
                        }
                    }
                }
            }
        });
        if(!userCourse)
            throw new NotFoundException("User has not purchased this course");

        // Forward to marketplace portal
        const uri = process.env.MARKETPLACE_PORTAL_URL;
        if(!uri)
            throw new HttpException("Marketplace URL not set", 500);

        // Fetch user details from user service

        if(!process.env.USER_SERVICE_URL)
            throw new HttpException("User service URL not defined", 500);

        let endpoint = `/api/mockFracService/user/${completeCourseDto.userId}`;

        const userResponse = await axios.get(process.env.USER_SERVICE_URL + endpoint);

        const customer = {
            name: userResponse.data.data.userName,
            phone: userResponse.data.data.phone || "+919999999999",
            email: userResponse.data.data.email
        }

        endpoint = `/api/consumer/course/complete`;
        const courseCompletionDto = {
            messageId: "123e4567-e89b-42d3-a456-556642440000",
            transactionId: "123e4567-e89b-42d3-a456-556642440000",
            bppId: "compass.bpp.course_manager",
            bppUri: "course.backend.compass.samagra.io",
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            providerName: userCourse.course.provider.orgName,
            providerCourseId: userCourse.courseId,
            providerOrderId: "123e4567-e89b-42d3-a456-556642440000",
            courseName: userCourse.course.title,
            courseLink: userCourse.course.courseLink,
            customer,
            price: {},
            status: "COMPLETED"
        }

        await axios.patch(uri + endpoint, courseCompletionDto);

        // Update a course as complete for a purchased course
        await this.prisma.userCourse.update({
            where: {
                userId_courseId: {
                    courseId: completeCourseDto.courseId,
                    userId: completeCourseDto.userId,
                }
            },
            data: {
                status: CourseProgressStatus.COMPLETED,
                courseCompletionScore: completeCourseDto.courseCompletionScore
            }
        })

    }

    async fetchAllCourses() : Promise<AdminCourseResponse[]> {
        
        // Fetch all courses
        const courses = await this.prisma.course.findMany({
            include: {
                provider: {
                    select: {
                        orgName: true,
                        orgLogo: true
                    }
                }
            }
        });
        return courses.map((c) => {
            const { provider, competency, ...clone } = c;
            return {
                ...clone,
                competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
                providerName: provider.orgName,
                providerLogo: provider.orgLogo
            }
        });
    }

    async acceptCourse(courseId: string, cqf_score?: number) {

        // Validate course
        let course = await this.getCourse(courseId);

        // Check if the course verfication is pending
        if(course.verificationStatus != CourseVerificationStatus.PENDING) {
            throw new NotAcceptableException(`Course is either rejected or is already accepted.`);
        }
        // Update the course as accepted
        const {competency, ...clone} = await this.prisma.course.update({
            where: { courseId },
            data: {
                verificationStatus: CourseVerificationStatus.ACCEPTED,
                cqfScore: cqf_score
            }
        });
        return {
            ...clone,
            competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
        }
    }

    async rejectCourse(courseId: string, rejectionReason: string) {

        // Validate course
        const course = await this.getCourse(courseId);

        // Check if the course verfication is pending
        if(course.verificationStatus != CourseVerificationStatus.PENDING) {
            throw new NotAcceptableException(`Course is already rejected or is accepted`);
        }
        // Reject the course
        const {competency, ...clone} = await this.prisma.course.update({
            where: { courseId },
            data: {
                verificationStatus: CourseVerificationStatus.REJECTED,
                rejectionReason: rejectionReason
            }
        });
        return {
            ...clone,
            competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
        }
    }

    async removeCourse(courseId: string) {
        
        // Validate course
        await this.getCourse(courseId);

        // Delete course entry
        const {competency, ...clone} = await this.prisma.course.delete({
            where: { courseId}
        });
        return {
            ...clone,
            competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
        }
    }

    async getCourseTransactions(providerId: string): Promise<CourseTransactionDto[]> {

        // Fetch course details and number of purchases
        const transactions = await this.prisma.course.findMany({
            where: {
                providerId
            },
            select: {
                courseId: true,
                title: true,
                startDate: true,
                endDate: true,
                credits: true,
                _count: {
                    select: {
                        userCourses: true
                    }
                }
            },
        });

        // Refactor to the DTO format required
        return transactions.map((c) => {
            return {
                courseId: c.courseId,
                courseName: c.title,
                startDate: c.startDate,
                endDate: c.endDate,
                credits: c.credits,
                numConsumersEnrolled: c._count.userCourses,
                income: c.credits * c._count.userCourses
            }
        });
    }

    async recommendedCourses(competencies: string[]): Promise<CourseResponse[]> {
        
        if(typeof competencies == "string")
            competencies = [competencies];

        let competencyFilter = (competencies) ? competencies.map(( competency ) => {

            return {
                competency: {
                    string_contains: competency
                }
            }
        }): undefined;
        let courses = await this.prisma.course.findMany({
            where: {
                verificationStatus: CourseVerificationStatus.ACCEPTED,
                status: CourseStatus.UNARCHIVED,
                OR: competencyFilter
            },
            include: {
                provider: {
                    select: {
                        orgName: true,
                    }
                },
                _count: {
                    select: {
                        userCourses: true
                    }
                }
            },
        });

        // Filter out the courses that are not available
        courses = courses.filter((c) => (c.startDate ? c.startDate <= new Date(): true) 
            && (c.endDate ? c.endDate >= new Date(): true)
        );
        return courses.map((c) => {
            let {cqfScore, impactScore, verificationStatus, rejectionReason, courseLink, provider, _count, competency, ...clone} = c;

            const courseResponse: CourseResponse = {
                ...clone,
                providerName: provider.orgName,
                numOfUsers: _count.userCourses,
                competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
            }
            return courseResponse;
        });
    }


    async mostPopularCourses(limit?: number, offset?: number): Promise<CourseResponse[]> {

        let courses = await this.prisma.course.findMany({
            where: {
                verificationStatus: CourseVerificationStatus.ACCEPTED,
                status: CourseStatus.UNARCHIVED,
            },
            include: {
                provider: {
                    select: {
                        orgName: true,
                    }
                },
                _count: {
                    select: {
                        userCourses: true
                    }
                }
            },
            orderBy: {
                avgRating: {
                    sort: "desc",
                    nulls: "last"
                }
            },
            skip: offset ? offset : 0,
            take: limit ? limit : 10
        });

        // Filter out the courses that are not available
        courses = courses.filter((c) => (c.startDate ? c.startDate <= new Date(): true) 
            && (c.endDate ? c.endDate >= new Date(): true)
        );
        return courses.map((c) => {
            let {cqfScore, impactScore, verificationStatus, rejectionReason, courseLink, provider, _count, competency, ...clone} = c;
            const courseResponse: CourseResponse = {
                ...clone,
                providerName: provider.orgName,
                numOfUsers: _count.userCourses,
                competency: (typeof competency == "string") ? JSON.parse(competency) : competency,
            }
            return courseResponse;
        });
    }

    async filterVerified(courses: SearchResponseDTO[]) {

        return courses.filter(async (course) => {
            const exists = await this.prisma.course.count({
                where: {
                    provider: {
                        name: course.provider_name
                    },
                    title: course.title,
                    verificationStatus: CourseVerificationStatus.ACCEPTED
                }
            });
            return exists !== 0;
        });

    }
}
