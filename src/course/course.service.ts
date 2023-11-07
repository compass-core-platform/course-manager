import { NotFoundException, BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FeedbackDto } from "./dto/feedback.dto";
import { CourseDto } from "./dto/course.dto";
import { AddCourseDto } from "./dto/add-course.dto";
import { CourseProgressStatus, CourseStatus, CourseVerificationStatus } from "@prisma/client";
import { CompleteCourseDto } from "./dto/completion.dto";
import { EditCourseDto } from "./dto/edit-course.dto";

@Injectable()
export class CourseService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async searchCourses(): Promise<CourseDto[]> {

        const courses = await this.prisma.course.findMany({
            // where: {
            //     title: {
            //         contains: searchDto.searchInput,
            //         mode: "insensitive",
            //     }
            // }
        })


        return courses;
    }

    async addCourse(providerId: number, addCourseDto: AddCourseDto) {

        return await this.prisma.course.create({
            data: {
                providerId,
                ...addCourseDto
            }
        });
    }

    async addPurchaseRecord(userId: string, courseId: number) {

        const record = this.prisma.userCourse.findFirst({
            where: { userId: userId, courseId: courseId }
        });

        if(record != null) {
            throw new BadRequestException("Course already purchased by the user");
        }

        return await this.prisma.userCourse.create({
            data: {
                userId,
                courseId,
            }
        });
    }

    async archiveCourse(providerId: number, courseId: number) {

        return this.prisma.course.update({
            where: { id: courseId },
            data: { status: CourseStatus.archived }
        });

    }

    async editCourse(providerId: number, courseId: number, editCourseDto: EditCourseDto) {
    
        return await this.prisma.course.update({
            where: { id: courseId },
            data: {
                providerId,
                title: editCourseDto.title,
                description: editCourseDto.description,
                courseLink: editCourseDto.courseLink,
                imgLink: editCourseDto.imgLink,
                credits: editCourseDto.credits,
                noOfLessons: editCourseDto.noOfLessons,
                language: editCourseDto.language,
                duration: editCourseDto.duration,
                competency: editCourseDto.competency,
                author: editCourseDto.author,
                verificationStatus: CourseVerificationStatus.pending,
                availabilityTime: editCourseDto.availabilityTime 
            }
        })
    }

    async getCourse(courseId: number): Promise<CourseDto> {

        const course = await this.prisma.course.findUnique({
            where: {
                id: courseId
            }
        })
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        return course;
    }

    async insertUserCourse(courseId: number, userId: string) {

        await this.getCourse(courseId);
            
        await this.prisma.userCourse.create({
            data: {
                courseId,
                userId
            }
        })        
    }

    async giveCourseFeedback(courseId: number, userId: string, feedbackDto: FeedbackDto) {

        await this.getCourse(courseId);

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
        
        if(userCourse.status != CourseProgressStatus.completed)
            throw new BadRequestException("Course not complete");
        
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
        
        await this.prisma.course.delete({
            where: {
                id: courseId
            }
        })
    }

    async getProviderCourses(providerId: number) {

        return this.prisma.course.findMany({
            where: {
                providerId
            }
        })

    }

    async getUserCourses(courseId: number) {

        return this.prisma.userCourse.findMany({
            where: {
                courseId
            },
        })
    }

    async markCourseComplete(completeCourseDto: CompleteCourseDto) {

        await this.prisma.userCourse.update({
            where: {
                userId_courseId: {
                    ...completeCourseDto
                }
            },
            data: {
                status: CourseProgressStatus.completed
            }
        })
    }

}
