import { Body, Controller, Delete, Get, HttpStatus, Logger, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Put, Res } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddCourseDto, AddCourseResponseDto } from 'src/course/dto/add-course.dto';
import { FeedbackResponseDto } from './dto/feedback.dto';
import { CourseTransactionDto } from '../course/dto/transaction.dto';
import { CompleteCourseDto } from 'src/course/dto/completion.dto';
import { EditCourseDto } from 'src/course/dto/edit-course.dto';
import { CourseResponse } from 'src/course/dto/course-response.dto';
import { ProviderProfileResponse } from './dto/provider-profile-response.dto';
import { getPrismaErrorStatusAndMessage } from 'src/utils/utils';

@Controller('provider')
@ApiTags('provider')
export class ProviderController {

    private readonly logger = new Logger(ProviderController.name);

    constructor(
        private providerService: ProviderService,
    ) {}

    @ApiOperation({ summary: 'create provider account' })
    @ApiResponse({ status: HttpStatus.CREATED, type: SignupResponseDto })
    @Post("/signup")
    // create a new provider account
    async createAccount(
        @Body() signupDto: SignupDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Creating new provider account`);

            const providerId = await this.providerService.createNewAccount(signupDto);

            this.logger.log(`successfully created new provider account`);

            res.status(HttpStatus.CREATED).json({
                message: "account created successfully",
                data: {
                    providerId
                }
            })
        } catch (err) {
            this.logger.error(`Failed to create new provider account`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to create new provider account`",
            });
        }
    }

    @ApiOperation({ summary: 'provider login' })
    @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
    @Post("/login")
    // provider login
    async login(
        @Body() loginDto: LoginDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting provider ID`);

            const providerId = await this.providerService.getProviderIdFromLogin(loginDto);

            this.logger.log(`successfully logged in`);

            res.status(HttpStatus.OK).json({
                message: "login successful",
                data: {
                    providerId
                }
            })
        } catch (err) {
            this.logger.error(`Failed to log in`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to log in`",
            });
        }
    }

    @ApiOperation({ summary: 'view provider profile' })
    @ApiResponse({ status: HttpStatus.OK, type: ProviderProfileResponse })
    @Get("/:providerId/profile")
    // view provider profile information
    async viewProfile(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting provider profile`);

            const provider = await this.providerService.getProvider(providerId);
            
            this.logger.log(`successfully retreived provider profile`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data : provider
            })
        } catch (err) {
            this.logger.error(`Failed to retreive provider profile`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive provider profile`",
            });
        }
    }

    @ApiOperation({ summary: 'update provider profile information' })
    @ApiResponse({ status: HttpStatus.OK })
    @Put("/:providerId/profile")
    // update provider profile information
    async updateProfile(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Body() updateProfileDto: UpdateProfileDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Updating provider profile`);

            await this.providerService.updateProfileInfo(providerId, updateProfileDto);

            this.logger.log(`successfully updated provider profile`);

            res.status(HttpStatus.OK).json({
                message: "account updated successfully",
            })
        } catch (err) {
            this.logger.error(`Failed to update provider profile`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to update provider profile`",
            });
        }
    }

    @ApiOperation({ summary: 'edit course information' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:providerId/course/:courseId")
    // edit course information
    async editCourse(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Body() editCourseDto: EditCourseDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Updating course information`);

            await this.providerService.editCourse(providerId, courseId, editCourseDto);

            this.logger.log(`Successfully updated course information`);

            res.status(HttpStatus.OK).json({
                message: "course edited successfully",
            })
        } catch (err) {
            this.logger.error(`Failed to update course information`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to update course information`",
            });
        }
    }

    @ApiOperation({ summary: 'Archive course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:providerId/course/:courseId/archive")
    // edit course information
    async archiveCourse(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        try {
            this.logger.log(`Archiving course`);

            await this.providerService.archiveCourse(providerId, courseId);

            this.logger.log(`Successfully archived the course`);

            res.status(HttpStatus.OK).json({
                message: "course archived successfully",
            })
        } catch (err) {
            this.logger.error(`Failed to archive the course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to archive the course`",
            });
        }
    }
    
    @ApiOperation({ summary: 'add new course' })
    @ApiResponse({ status: HttpStatus.CREATED, type: AddCourseResponseDto })
    @Post("/:providerId/course")
    // add new course
    async addCourse(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Body() addCourseDto: AddCourseDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Adding new course`);

            const course = await this.providerService.addNewCourse(providerId, addCourseDto);

            this.logger.log(`Successfully added new course`);

            res.status(HttpStatus.CREATED).json({
                message: "course added successfully",
                data: course
            })
        } catch (err) {
            this.logger.error(`Failed to add the course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to add the course`",
            });
        }
    }

    @ApiOperation({ summary: 'remove a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Delete("/:providerId/course/:courseId")
    // remove an existing course
    async removeCourse(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        try {
            this.logger.log(`Removing course`);

            await this.providerService.removeCourse(providerId, courseId);

            this.logger.log(`Successfully deleted the course`);


            res.status(HttpStatus.OK).json({
                message: "course deleted successfully",
            })
        } catch (err) {
            this.logger.error(`Failed to delete the course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to delete the course`",
            });
        }
    }

    @ApiOperation({ summary: 'View courses offered by self' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseResponse] })
    @Get("/:providerId/course")
    // View courses offered by self
    async fetchProviderCourses(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting courses`);

            const courses = await this.providerService.getCourses(providerId);

            this.logger.log(`Successfully retrieved the courses`);

            res.status(HttpStatus.OK).json({
                message: "courses fetched successfully",
                data: courses
            })
        } catch (err) {
            this.logger.error(`Failed to fetch the courses`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the courses",
            });
        }
    }

    @ApiOperation({ summary: 'View Course Feedback & ratings, numberOfPurchases' })
    @ApiResponse({ status: HttpStatus.OK, type: FeedbackResponseDto })
    @Get("/:providerId/course/:courseId/feedback")
    // View Course Feedback & ratings, numberOfPurchases
    async getCourseFeedback(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting course feedbacks`);

            const feedbackResponse = await this.providerService.getCourseFeedbacks(providerId, courseId);

            this.logger.log(`Successfully retrieved the feedbacks`);

            res.status(HttpStatus.OK).json({
                message: "feedbacks fetched successfully",
                data: feedbackResponse
            })
        } catch (err) {
            this.logger.error(`Failed to fetch the feedbacks`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the feedbacks",
            });
        }
    }

    @ApiOperation({ summary: 'Get transactions of all courses' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseTransactionDto] })
    @Get("/:providerId/course/transactions")
    // Get transactions of all courses
    async getCourseTransactions(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting course transactions`);

            const transactionsResponse = await this.providerService.getCourseTransactions(providerId);

            this.logger.log(`Successfully retrieved course transactions`);

            res.status(HttpStatus.OK).json({
                message: "transactions fetched successfully",
                data: transactionsResponse
            })
        } catch (err) {
            this.logger.error(`Failed to fetch the transactions`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the transactions",
            });
        }
    }

    @ApiOperation({ summary: 'Mark course as complete' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:providerId/course/completion")
    // Mark course as complete for a user
    async markCourseComplete(
        @Param("providerId", ParseUUIDPipe) providerId: string,
        @Body() completeCourseDto: CompleteCourseDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Updating course as complete`);

            await this.providerService.markCourseComplete(providerId, completeCourseDto);

            this.logger.log(`Successfully marked the course as complete`);

            res.status(HttpStatus.OK).json({
                message: "course marked complete",
            })
        } catch (err) {
            this.logger.error(`Failed to mark the course completion`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to mark the course completion",
            });
        }
    }
}