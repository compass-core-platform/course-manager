import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SearchDto } from "./dto/search.dto";
import { CourseDto } from "./dto/course.dto";
import { FeedbackDto } from "./dto/feedback.dto";

@Injectable()
export class CourseService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async searchCourses(searchDto: SearchDto): Promise<CourseDto[]> {

        const courses = await this.prisma.course.findMany({
            where: {
                title: {
                    contains: searchDto.searchInput,
                    mode: "insensitive",
                }
            }
        })


        return courses;
    }

    async getOneCourse(courseId: number): Promise<CourseDto> {

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

        await this.getOneCourse(courseId);
            
        await this.prisma.userCourse.create({
            data: {
                courseId,
                userId
            }
        })        
    }

    async giveCourseFeedback(courseId: number, userId: string, feedbackDto: FeedbackDto) {

        await this.getOneCourse(courseId);
        
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
}
