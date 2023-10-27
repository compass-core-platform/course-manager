import { Controller, Body, Get, Post, Patch, Res, Delete, HttpStatus, Param, ParseIntPipe, Logger} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ProviderProfileResponse } from './dto/provider-profile-response.dto';
import { getPrismaErrorStatusAndMessage } from '../utils/utils';
import { EditProvider } from './dto/edit-provider.dto';
import { CourseResponse } from './dto/course-response.dto';
import { CourseVerify } from './dto/verify-course.dto';
import { TransactionResponse } from './dto/transaction-response.dto';
import { Response } from 'express';
import { CreditRequest } from './dto/credit-request.dto';
import { json } from 'stream/consumers';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
    private readonly logger = new Logger(AdminController.name);

    constructor(private adminService: AdminService) {}

    @ApiOperation({ summary: "Get all providers" })
    @ApiResponse({ status: HttpStatus.OK, type: ProviderProfileResponse, isArray: true})
    @Get('/providers')
    async getAllProviders(@Res() res : Response) {
        try {
            this.logger.log(`Getting information of all the providers`);

            const providers = await this.adminService.findAllProviders();

            this.logger.log(`Successfully retrieved all the providers`);

            res.status(HttpStatus.OK).json({
                message: "All providers fetched",
                data: providers
            });
        } catch (err) {
            this.logger.error(`Failed to retreive all the providers' information`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch all the providers' information",
            });
        }
    }

    @ApiOperation({ summary: "View provider profile information"})
    @ApiResponse({ status: HttpStatus.OK, type: ProviderProfileResponse})
    @Get('/providers/:providerId')
    async getProviderProfile (
        @Param("providerId", ParseIntPipe) providerId: number, @Res() res: Response
    ) {
        try {
            this.logger.log(`Getting provider information for id ${providerId}`);

            const provider = await this.adminService.findProviderById(providerId);

            this.logger.log(`Successfully retrieved the provider profile information`);

            res.status(HttpStatus.OK).json({
                message: "Provider profile retrieved successfully",
                data: provider
            });
        } catch (err) {
            this.logger.error(`Failed to retrieve the provider profile information`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || "Failed to retrieve the profile information for the given providerId",
            });
        }
    }


    @ApiOperation({ summary: "Edit provider profile information"})
    @ApiResponse({ status: HttpStatus.OK, type: ProviderProfileResponse})
    @Patch('/providers/:providerId')
    async editProviderProfile (
        @Param("providerId", ParseIntPipe) providerId: number, @Body() providerDto: EditProvider ,@Res() res
    ){
        try {
            this.logger.log(`Getting provider information for id ${providerId}`);
            
            const updatedProviderInfo = {
                id: providerDto.id,
                name: providerDto.name,
                email: providerDto.email,
                paymentInfo: providerDto.paymentInfo,
                walletId: providerDto.walletId,
                status: providerDto.status
            }

            const updatedProfile = await this.adminService.editProviderProfile(updatedProviderInfo);

            this.logger.log(`Successfully retrieved the provider profile information`);

            res.status(HttpStatus.OK).json({
                message: "Provider profile retrieved successfully",
                data: updatedProfile
            });
        } catch (err) {
            this.logger.error(`Failed to retrieve the provider profile information`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || "Failed to retrieve the profile information for the given providerId",
            });
        }
    }

    @ApiOperation({ summary: "Get all the courses"})
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse, isArray: true})
    @Get('/courses/')
    async getAllCourses(@Res() res){
        try {
            this.logger.log(`Fetching all courses on marketplace (verified, pending & rejected)`);

            const courses = await this.adminService.findAllCourses();

            this.logger.log(`Successfully retrieved all the courses`);

            res.status(HttpStatus.OK).json({
                message: "All courses retrieved successfully",
                data: courses
            });
        } catch (err) {
            this.logger.error(`Failed to retrieve all courses`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || "Failed to retrieve all courses",
            });
        }
    }

    @ApiOperation({ summary: "Get a course, given its courseId"})
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse})
    @Get('/course/:courseId')
    async getCourseById (
        @Param("courseId", ParseIntPipe) courseId: number, @Res() res
    ){
        try {
            this.logger.log(`Getting course information for id ${courseId}`);
            
            const course = this.adminService.findCourseById(courseId);

            this.logger.log(`Successfully retrieved the course`);

            res.status(HttpStatus.OK).json({
                message: "Course retrieved successfully",
                data: course
            });
        } catch (err) {
            this.logger.error(`Failed to retrieve the course for the courseId ${courseId}`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to retrieve the course with id ${courseId}`,
            });
        }
    }


    @ApiOperation({ summary: "Accept course and assign a cqf_score"})
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse})
    @Patch('/course/:courseId/accept')
    async acceptCourse (
        @Param("courseId", ParseIntPipe) courseId: number, @Body() verifyBody: CourseVerify, @Res() res
    ) {
        try {
            this.logger.log(`Verifying the course with id ${courseId}`);
            
            const course = this.adminService.acceptCourse(courseId, verifyBody.cqf_score);

            this.logger.log(`Successfully accepted the course`);

            res.status(HttpStatus.OK).json({
                message: "Course accepted successfully",
                data: course
            });
        } catch (err) {
            this.logger.error(`Failed to accept the course for the courseId ${courseId}`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to accept the course with id ${courseId}`,
            });
        }
    }

    @ApiOperation({ summary: "Reject a course given its courseId"})
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse})
    @Patch('/course/:courseId/reject')
    async rejectCourse (
        @Param("courseId", ParseIntPipe) courseId: number, @Res() res
    ) {
        try {
            this.logger.log(`Processing reject request of course with id ${courseId}`);
            
            const course = this.adminService.rejectCourse(courseId);

            this.logger.log(`Successfully rejected the course`);

            res.status(HttpStatus.OK).json({
                message: "Course rejected successfully",
                data: course
            });
        } catch (err) {
            this.logger.error(`Failed to reject the course with the courseId ${courseId}`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to reject the course with id ${courseId}`,
            });
        }
    }

    @ApiOperation({ summary: "Remove a course given its courseId"})
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse})
    @Delete('/course/:courseId')
    async removeCourse (
        @Param("courseId", ParseIntPipe) courseId: number, @Res() res
    ) {
        try {
            this.logger.log(`Processing removal request of course with id ${courseId}`);
            
            const course = this.adminService.removeCourse(courseId);

            this.logger.log(`Successfully deleted the course`);

            res.status(HttpStatus.OK).json({
                message: "Course deleted successfully",
                data: course
            });
        } catch (err) {
            this.logger.error(`Failed to delete the course with the courseId ${courseId}`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to delete the course with id ${courseId}`,
            });
        }
    }

    

    @ApiOperation({ summary: "Get transaction history between admin and consumers"})
    @ApiResponse({ status: HttpStatus.OK, type: TransactionResponse, isArray: true})
    @Get('/:adminId/transactions/consumers')
    async getTransactions (@Param("adminId") adminId: number, @Res() res
    ){
        try {
            this.logger.log(`Getting all transactions between admin and consumers.`);
            
            const transactions = this.adminService.getTransactions(adminId);

            this.logger.log(`Successfully fetched all the transactions between admin and consumers`);

            res.status(HttpStatus.OK).json({
                message: "Fetched admin-consumers transactions",
                data: transactions
            });
        } catch (err) {
            this.logger.error(`Failed to fetch the transactions between admin and consumers`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to fetch the transactions between admin and consumers`,
            });
        }
    }

    @ApiOperation({ summary: "Add credits to a Provider"})
    @ApiResponse({ status: HttpStatus.OK, type: json})
    @Post('/:adminId/providers/credits/addCredits')
    async addCredits (@Param("adminId") adminId: number, @Body() reqBody: CreditRequest, @Res() res
    ){
        try {
            this.logger.log(`Adding credits to providers' wallet`);

            const providerId = reqBody.providerId;
            const credits = reqBody.credits;
            
            const provider = this.adminService.addOrRemoveCreditsToProvider(adminId, providerId, credits);

            this.logger.log(`Succesfully Added credits to providers' wallet.`);

            res.status(HttpStatus.OK).json({
                message: "Added credits to provider",
                data: provider
            });
        } catch (err) {
            this.logger.error(`Failed to add credits to the provider`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to add credits to the provider`,
            });
        }
    }
    
    @ApiOperation({ summary: "Remove credits from a Provider"})
    @ApiResponse({ status: HttpStatus.OK, type: json })
    @Post('/:adminId/providers/credits/reduceCredits')
    async reduceCredits (@Param("adminId") adminId: number, @Body() reqBody: CreditRequest, @Res() res
    ){
        try {
            this.logger.log(`Reducing credits from providers' wallet`);

            const providerId = reqBody.providerId;
            const credits = reqBody.credits;
            
            const provider = this.adminService.addOrRemoveCreditsToProvider(adminId, providerId, credits);

            this.logger.log(`Succesfully reduced credits from providers' wallet.`);

            res.status(HttpStatus.OK).json({
                message: "Removed credits from provider",
                data: provider
            });
        } catch (err) {
            this.logger.error(`Failed to remove credits from the provider`);
            
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || `Failed to remove credits from the provider`,
            });
        }
    }
}
