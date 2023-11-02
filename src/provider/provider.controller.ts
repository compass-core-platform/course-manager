import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Res } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddCourseDto, AddCourseResponseDto } from 'src/course/dto/add-course.dto';
import { ViewProfileResponseDto } from './dto/view-profile.dto';
import { FeedbackResponseDto } from './dto/feedback.dto';
import { PurchaseResponseDto } from './dto/purchase.dto';
import { CourseDto } from 'src/course/dto/course.dto';
import { CompleteCourseDto } from 'src/course/dto/completion.dto';

@Controller('provider')
export class ProviderController {
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
        const providerId = await this.providerService.createNewAccount(signupDto);

        res.status(HttpStatus.CREATED).json({
            message: "account created successfully",
            data: {
                providerId
            }
        })
    }

    @ApiOperation({ summary: 'provider login' })
    @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
    @Post("/login")
    // provider login
    async login(
        @Body() loginDto: LoginDto,
        @Res() res
    ) {
        const providerId = await this.providerService.getProviderIdFromLogin(loginDto);

        res.status(HttpStatus.OK).json({
            message: "login successful",
            data: {
                providerId
            }
        })
    }

    @ApiOperation({ summary: 'view provider profile' })
    @ApiResponse({ status: HttpStatus.OK, type: ViewProfileResponseDto })
    @Get("/:providerId/profile")
    // view provider profile information
    async viewProfile(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Res() res
    ) {
        const provider = await this.providerService.getProvider(providerId);

         res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data : provider
        })
    }

    @ApiOperation({ summary: 'update provider profile information' })
    @ApiResponse({ status: HttpStatus.OK })
    @Put("/:providerId/profile")
    // update provider profile information
    async updateProfile(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Body() updateProfileDto: UpdateProfileDto,
        @Res() res
    ) {
        await this.providerService.updateProfileInfo(providerId, updateProfileDto);

        res.status(HttpStatus.OK).json({
            message: "account updated successfully",
        })
    }
    
    @ApiOperation({ summary: 'add new course' })
    @ApiResponse({ status: HttpStatus.CREATED, type: AddCourseResponseDto })
    @Post("/:providerId/course")
    // add new course
    async addCourse(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Body() addCourseDto: AddCourseDto,
        @Res() res
    ) {
        const course = await this.providerService.addNewCourse(providerId, addCourseDto);

        res.status(HttpStatus.CREATED).json({
            message: "course added successfully",
            data: course
        })
    }

    @ApiOperation({ summary: 'remove a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Delete("/:providerId/course/:courseId")
    // remove an existing course
    async removeCourse(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        await this.providerService.removeCourse(providerId, courseId);

        res.status(HttpStatus.OK).json({
            message: "course deleted successfully",
        })
    }

    @ApiOperation({ summary: 'View courses offered by self' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseDto] })
    @Get("/:providerId/course")
    // View courses offered by self
    async fetchProviderCourses(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Res() res
    ) {
        const courses = await this.providerService.getCourses(providerId);

        res.status(HttpStatus.OK).json({
            message: "courses fetched successfully",
            data: courses
        })
    }

    @ApiOperation({ summary: 'View Course Feedback & ratings, numberOfPurchases' })
    @ApiResponse({ status: HttpStatus.OK, type: FeedbackResponseDto })
    @Get("/:providerId/course/:courseId/feedback")
    // View Course Feedback & ratings, numberOfPurchases
    async getCourseFeedback(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        const feedbackResponse = await this.providerService.getCourseFeedbacks(providerId, courseId);

        res.status(HttpStatus.OK).json({
            message: "feedbacks fetched successfully",
            data: feedbackResponse
        })
    }

    @ApiOperation({ summary: 'Get all transactions for course purchase user wise' })
    @ApiResponse({ status: HttpStatus.OK, type: [PurchaseResponseDto] })
    @Get("/:providerId/course/:courseId/purchases")
    // Get all the transactions for course purchase user wise
    async getCoursePurchases(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        const purchaseResponse = await this.providerService.getCoursePurchases(providerId, courseId);

        res.status(HttpStatus.OK).json({
            message: "purchases fetched successfully",
            data: purchaseResponse
        })
    }

    @ApiOperation({ summary: 'Mark course as complete' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:providerId/course/completion")
    // Mark course as complete for a user
    async markCourseComplete(
        @Param("providerId", ParseIntPipe) providerId: number,
        @Body() completeCourseDto: CompleteCourseDto,
        @Res() res
    ) {
        await this.providerService.markCourseComplete(providerId, completeCourseDto);

        res.status(HttpStatus.OK).json({
            message: "course marked complete",
        })
    }
}