import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { CourseDto } from "./dto/course.dto";
import { FeedbackDto } from "./dto/feedback.dto";

@Controller('course')
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @ApiOperation({ summary: 'Search courses' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseDto] })
    @Get("/search")
    // search courses
    async searchCourses(
        // @Body() searchDto: SearchDto,
        @Res() res
    ) {
        const courses = await this.courseService.searchCourses();

        res.status(HttpStatus.OK).json({
            message: "search successful",
            data: courses
        })
    }

    @ApiOperation({ summary: 'Fetch details of one course' })
    @ApiResponse({ status: HttpStatus.OK, type: CourseDto })
    @Get("/:courseId")
    // Fetch details of one course
    async getCourse(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        const course = await this.courseService.getCourse(courseId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: course
        })
    }

    @ApiOperation({ summary: 'Confirmation of user purchase of a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:courseId/purchase/:userId")
    // Confirmation of user purchase of a course
    async purchaseCourse(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Param("userId") userId: string,
        @Res() res
    ) {
        await this.courseService.insertUserCourse(courseId, userId);

        res.status(HttpStatus.OK).json({
            message: "purchase successful"
        })
    }

    @ApiOperation({ summary: 'Give feedback and rating' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:courseId/purchase/:userId")
    // Give feedback and rating
    async feedback(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Param("userId") userId: string,
        @Body() feedbackDto: FeedbackDto,
        @Res() res
    ) {
        await this.courseService.giveCourseFeedback(courseId, userId, feedbackDto);

        res.status(HttpStatus.OK).json({
            message: "feedback successful"
        })
    }

}
