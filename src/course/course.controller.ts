import { Body, Controller, Get, HttpStatus, Logger, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { FeedbackDto } from "./dto/feedback.dto";
import { CourseResponse } from "./dto/course-response.dto";
import { getPrismaErrorStatusAndMessage } from "src/utils/utils";
import { SearchResponseDTO } from "./dto/search-response.dto";
import { PurchaseDto, PurchaseResponseDto } from "./dto/purchase.dto";

@Controller('course')
@ApiTags('course')
export class CourseController {

    private readonly logger = new Logger(CourseController.name);

    constructor(private readonly courseService: CourseService) {}

    @ApiOperation({ summary: 'Search courses' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseResponse] })
    @Get("/search")
    // search courses
    async searchCourses(
        @Query('searchInput') searchInput: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting information of courses`);

            const courses = await this.courseService.searchCourses(searchInput);

            this.logger.log(`Successfully retrieved the courses`);

            res.status(HttpStatus.OK).json({
                message: "search successful",
                data: courses
            })
        } catch (err) {
            this.logger.error(`Failed to retreive the courses' information`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the courses' information",
            });
        }
    }

    @ApiOperation({ summary: 'Fetch details of one course' })
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse })
    @Get("/:courseId")
    // Fetch details of one course
    async getCourse(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting information of one course`);

            const course = await this.courseService.getCourseByConsumer(courseId);

            this.logger.log(`Successfully retrieved the course`);
            
            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: course
            })
        } catch (err) {
            this.logger.error(`Failed to retreive the course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the course",
            });
        }
    }

    @ApiOperation({ summary: 'Confirmation of user purchase of a course' })
    @ApiResponse({ status: HttpStatus.OK, type: PurchaseResponseDto })
    @Post("/:courseId/purchase")
    // Confirmation of user purchase of a course
    async purchaseCourse(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Body() purchaseDto: PurchaseDto,

        @Res() res
    ) {
        try {
            this.logger.log(`Recording the user purchase of the course`);

            const transactionId = await this.courseService.addPurchaseRecord(courseId, purchaseDto);

            this.logger.log(`Successfully recorded the purchase`);

            res.status(HttpStatus.OK).json({
                message: "purchase successful",
                data: {
                    walletTransactionId: transactionId
                }
            })
        } catch (err) {
            this.logger.error(`Failed to record the purchase`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to record the purchase",
            });
        }
    }

    @ApiOperation({ summary: 'Give feedback and rating' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:courseId/feedback/:userId")
    // Give feedback and rating
    async feedback(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Param("userId", ParseUUIDPipe) userId: string,
        @Body() feedbackDto: FeedbackDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Recording the course feedback`);

            await this.courseService.giveCourseFeedback(courseId, userId, feedbackDto);

            this.logger.log(`Successfully recorded the feedback`);

            res.status(HttpStatus.OK).json({
                message: "feedback successful"
            })
        } catch (err) {
            this.logger.error(`Failed to record the feedback`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to record the feedback",
            });
        }
    }

    @ApiOperation({ summary: 'Filter for verified Courses' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/verifyFilter")
    // Filter for admin verified courses
    async verifiedFilter(
        @Body() courses: SearchResponseDTO[],
        @Res() res
    ) {
        try {
            this.logger.log(`Filtering for courses verified by admin`);

            const filteredCourses: SearchResponseDTO[] = await this.courseService.filterVerified(courses);

            this.logger.log(`Successfully filtered the courses`);

            res.status(HttpStatus.OK).json({
                message: "Filtering successfull",
                data: filteredCourses
            });
        } catch (err) {
            this.logger.error(`Failed to filter the courses`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to filter the courses",
            });
        }
    }

}
