import { NotFoundException, BadRequestException, Injectable, NotAcceptableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { FeedbackDto } from "./dto/feedback.dto";
import { AddCourseDto } from "./dto/add-course.dto";
import { Course, CourseProgressStatus, CourseStatus, CourseVerificationStatus } from "@prisma/client";
import { CompleteCourseDto } from "./dto/completion.dto";
import { EditCourseDto } from "./dto/edit-course.dto";
import { AdminCourseResponse, CourseResponse } from "src/course/dto/course-response.dto";
import { CourseTransactionDto } from "./dto/transaction.dto";
import { SearchResponseDTO } from "./dto/search-response.dto";

@Injectable()
export class CourseService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async searchCourses(searchInput: string): Promise<SearchResponseDTO[]> {

        // Searches for the courses available in the DB that match or contain the input search string
        // in their title, author, description or competency
        const courses = await this.prisma.course.findMany({
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
            }
        });

        const respPromises = courses.map(async (course) => {
            const provider = await this.prisma.provider.findFirst({
                where: {
                    id: course.providerId
                }
            });
            const noOfPurchases = await this.prisma.userCourse.count({
                where: {
                    courseId: course.id
                }
            });
            const providerName = provider?.name || "null";
            return {
                id: course.id.toString(),
                title: course.title,
                long_desc: course.description,
                provider_id: course.providerId,
                provider_name: providerName,
                price: course.credits.toString(),
                languages: course.language,
                competency: course.competency,
                imgUrl: course.imgLink,
                rating: course.avgRating?.toString() || "0",
                startTime: new Date().toISOString(), // need to change
                endTime: new Date().toISOString(), // need to change
                noOfPurchases: noOfPurchases.toString()
            }
        });
        
        const resp = await Promise.all(respPromises);
        return resp;
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

    async addPurchaseRecord(courseId: number, userId: string) {

        // Check if course already purchased
        const record = this.prisma.userCourse.findFirst({
            where: { userId: userId, courseId: courseId }
        });
        if(record != null)
            throw new BadRequestException("Course already purchased by the user");

        // create new record for purchase
        return await this.prisma.userCourse.create({
            data: {
                userId,
                courseId,
            }
        });
    }

    async archiveCourse(courseId: number) {

        // update the course status to archived
        return this.prisma.course.update({
            where: { id: courseId },
            data: { status: CourseStatus.ARCHIVED }
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
            }
        })
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        return course;
    }

    async giveCourseFeedback(courseId: number, userId: string, feedbackDto: FeedbackDto) {

        // Validate course
        await this.getCourse(courseId);

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
    }

    async deleteCourse(courseId: number) {
        
        // Delete the course entry from db
        await this.prisma.course.delete({
            where: {
                id: courseId
            }
        })
    }

    async getProviderCourses(providerId: string) {

        // Get all courses added by a single provider
        return this.prisma.course.findMany({
            where: {
                providerId
            }
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

    async fetchAllCourses() : Promise<Course[]> {
        
        // Fetch all courses
        return this.prisma.course.findMany();
    }

    async acceptCourse(courseId: number, cqf_score: number) {

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
