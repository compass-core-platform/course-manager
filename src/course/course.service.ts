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
import { PurchaseDto, WalletPurchaseDto } from "./dto/purchase.dto";

@Injectable()
export class CourseService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async searchCourses(searchInput: string): Promise<SearchResponseDTO[]> {

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
                        string_contains: searchInput
                    }
                }]
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
        // courses = courses.map((c) => {
        //     let {cqfScore, impactScore, verificationStatus, rejectionReason, provider, ...clone} = c;
        //     const courseResponse: CourseResponse = {
        //         ...clone,
        //         providerName: provider.orgName
        //     }
        //     return courseResponse;
        // });
        return courses.map((course) => {
            return {
                id: course.id.toString(),
                title: course.title,
                long_desc: course.description,
                provider_id: course.providerId,
                provider_name: course.provider.orgName,
                price: course.credits.toString(),
                languages: course.language,
                competency: course.competency,
                imgUrl: course.imgLink,
                rating: course.avgRating?.toString() || "0",
                startTime: new Date().toISOString(), // need to change
                endTime: new Date().toISOString(), // need to change
                noOfPurchases: course._count.userCourses,
            }
        });
    }

    async addCourse(providerId: string, addCourseDto: AddCourseDto) {

        // add new course to the platform
        return await this.prisma.course.create({
            data: {
                providerId,
                ...addCourseDto
            }
        });
    }

    async addPurchaseRecord(courseId: number, purchaseDto: PurchaseDto) {

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
            where: { userId: purchaseDto.consumerId, courseId: courseId }
        });
        if(record != null)
            throw new BadRequestException("Course already purchased by the user");


        // create new record for purchase
        await this.prisma.userCourse.create({
            data: {
                userId: purchaseDto.consumerId,
                courseId,
            }
        });
        // forward to wallet service for transaction
        try {
            const endpoint = `/api/consumers/${purchaseDto.consumerId}/purchase`;
            const walletPurchaseBody: WalletPurchaseDto = {
                providerId: course.providerId,
                credits: course.credits,
                description: purchaseDto.transactionDescription
            }
            const walletResponse = await axios.post(process.env.WALLET_SERVICE_URL + endpoint, walletPurchaseBody);
            return walletResponse.data.data.transaction.transactionId;
        } catch (err) {
            // if transaction failed, delete the record
            await this.prisma.userCourse.delete({
                where: {
                    userId_courseId: {
                        userId: purchaseDto.consumerId,
                        courseId
                    }
                }
            });
            throw new HttpException(err.response || "Wallet service not running", err.response?.status || err.status || 500)
        }
    }

    async changeStatus(courseId: number, providerId: string, courseStatusDto: CourseStatusDto) {

        // Validate course
        const course = await this.getCourse(courseId)

        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to the provider");

        // update the course status to archived
        return this.prisma.course.update({
            where: { id: courseId, providerId },
            data: { status: courseStatusDto.status }
        });
    }

    async editCourse(courseId: number, editCourseDto: EditCourseDto) {
    
        // update the course details as required and change its verification status to pending
        return this.prisma.course.update({
            where: { id: courseId },
            data: {
                ...editCourseDto,
                verificationStatus: CourseVerificationStatus.PENDING,
            }
        });
    }

    async getCourse(courseId: number): Promise<AdminCourseResponse> {

        // Find course by ID and throw error if not found
        const course = await this.prisma.course.findUnique({
            where: {
                id: courseId
            },
            include: {
                provider: {
                    select: {
                        orgName: true,
                    }
                }
            }
        })
        if(!course)
            throw new NotFoundException("Course does not exist");

        // let courseResponse: AdminCourseResponse
        const { provider, ...courseResponse } = course;
        return {
            ...courseResponse,
            providerName: provider.orgName
        }
    }

    async getNumOfCourseUsers(courseId: number) {

        return this.prisma.userCourse.count({
            where: {
                courseId
            }
        })
    }

    async getCourseByConsumer(courseId: number): Promise<CourseResponse> {

        // Find course by ID and throw error if not found
        const course = await this.getCourse(courseId);
        const numOfUsers = await this.getNumOfCourseUsers(courseId);

        if(course.verificationStatus != CourseVerificationStatus.ACCEPTED)
            throw new BadRequestException("Course is not accepted");
        if(course.status != CourseStatus.UNARCHIVED)
            throw new BadRequestException("Course is archived");
        if((course.startDate && course.startDate > new Date()) || (course.endDate && course.endDate < new Date()))
            throw new BadRequestException("Course is not available at the moment");
        
        const {cqfScore, impactScore, verificationStatus, rejectionReason, ...clone} = course;
        return {
            ...clone,
            numOfUsers
        }
    }

    async giveCourseFeedback(courseId: number, userId: string, feedbackDto: FeedbackDto) {

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
                id: courseId
            },
            data: {
                avgRating: avgRating._avg.rating
            }
        });
    }

    async deleteCourse(courseId: number) {
        
        // Delete the course entry from db
        await this.prisma.course.delete({
            where: {
                id: courseId
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
            const {cqfScore, impactScore, ...clone} = c;
            return clone;
        })
    }

    async getPurchasedUsersByCourseId(courseId: number) {

        // Get all users that have bought a course
        return this.prisma.userCourse.findMany({
            where: {
                courseId
            },
        })
    }

    async markCourseComplete(completeCourseDto: CompleteCourseDto) {

        // Update a course as complete for a purchased course
        await this.prisma.userCourse.update({
            where: {
                userId_courseId: {
                    ...completeCourseDto
                }
            },
            data: {
                status: CourseProgressStatus.COMPLETED
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
                    }
                }
            }
        });
        return courses.map((c) => {
            const { provider, ...clone } = c;
            return {
                ...clone,
                providerName: provider.orgName
            }
        });
    }

    async acceptCourse(courseId: number, cqf_score?: number) {

        // Validate course
        let course = await this.getCourse(courseId);

        // Check if the course verfication is pending
        if(course.verificationStatus != CourseVerificationStatus.PENDING) {
            throw new NotAcceptableException(`Course is either rejected or is already accepted.`);
        }
        // Update the course as accepted
        return this.prisma.course.update({
            where: { id: courseId },
            data: {
                verificationStatus: CourseVerificationStatus.ACCEPTED,
                cqfScore: cqf_score
            }
        });
    }

    async rejectCourse(courseId: number, rejectionReason: string) {

        // Validate course
        const course = await this.getCourse(courseId);

        // Check if the course verfication is pending
        if(course.verificationStatus != CourseVerificationStatus.PENDING) {
            throw new NotAcceptableException(`Course is already rejected or is accepted`);
        }
        // Reject the course
        return this.prisma.course.update({
            where: {id: courseId},
            data: {
                verificationStatus: CourseVerificationStatus.REJECTED,
                rejectionReason: rejectionReason
            }
        });
    }

    async removeCourse(courseId: number) {
        
        // Validate course
        await this.getCourse(courseId);

        // Delete course entry
        return this.prisma.course.delete({
            where: {id: courseId}
        });
    }

    async getCourseTransactions(providerId: string): Promise<CourseTransactionDto[]> {

        // Fetch course details and number of purchases
        const transactions = await this.prisma.course.findMany({
            where: {
                providerId
            },
            select: {
                id: true,
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
                courseId: c.id,
                courseName: c.title,
                startDate: c.startDate,
                endDate: c.endDate,
                credits: c.credits,
                numConsumersEnrolled: c._count.userCourses,
                income: c.credits * c._count.userCourses
            }
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
