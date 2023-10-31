import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddCourseDto } from "./dto/add-course.dto";
import { CourseProgressStatus } from "@prisma/client";
import { CompleteCourseDto } from "./dto/completion.dto";

@Injectable()
export class CourseService {
    constructor(private prisma: PrismaService) {}
  
    async addCourse(providerId: number, addCourseDto: AddCourseDto) {

        return this.prisma.course.create({
            data: {
                providerId,
                ...addCourseDto
            }
        })
    }

    async getCourse(courseId: number) {

        return this.prisma.course.findUnique({
            where: {
                id: courseId
            }
        })
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
