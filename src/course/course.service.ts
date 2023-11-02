import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FeedbackDto } from "./dto/feedback.dto";
import { CourseDto } from "./dto/course.dto";
import { AddCourseDto } from "./dto/add-course.dto";
import { CompleteCourseDto } from "./dto/completion.dto";
import { CourseProgressStatus } from "@prisma/client";

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

        return this.prisma.course.create({
            data: {
                providerId,
                ...addCourseDto
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
        
        try {
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
        } catch {
            throw new NotFoundException("This user has not subscribed to this course");
        }
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
