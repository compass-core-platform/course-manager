import { BadRequestException, HttpException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProviderStatus } from '@prisma/client';
import { CheckRegResponseDto, LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddCourseDto } from 'src/course/dto/add-course.dto';
import { CourseService } from 'src/course/course.service';
import { Feedback, FeedbackResponseDto } from './dto/feedback.dto';
import { CourseTransactionDto } from '../course/dto/transaction.dto';
import { CompleteCourseDto } from 'src/course/dto/completion.dto';
import { EditCourseDto } from 'src/course/dto/edit-course.dto';
import { EditProvider } from 'src/admin/dto/edit-provider.dto';
import { ProviderCourseResponse } from 'src/course/dto/course-response.dto';
import { ProviderProfileResponse } from './dto/provider-profile-response.dto';
import { AuthService } from 'src/auth/auth.service';
import axios from 'axios';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CourseStatusDto } from 'src/course/dto/course-status.dto';
import { ProviderSettlementDto } from 'src/admin/dto/provider-settlement.dto';


@Injectable()
export class ProviderService {
    constructor(
        private prisma: PrismaService,
        private courseService: CourseService,
        private authService: AuthService
    ) {}

    async createNewAccount(signupDto: SignupDto) {

        // Check if email already exists
        let provider = await this.prisma.provider.findUnique({
            where : {
                email: signupDto.email
            }
        });

        if(provider)
            throw new BadRequestException("Account with that email ID already exists");

        // Hashing the password
        const hashedPassword = await this.authService.hashPassword(signupDto.password);

        // Create an entry in the database
        provider = await this.prisma.provider.create({
            data: {
                name: signupDto.name,
                email: signupDto.email,
                password: hashedPassword,
                paymentInfo: signupDto.paymentInfo,
                orgName: signupDto.orgName,
                orgLogo: signupDto.orgLogo,
                phone: signupDto.phone
            }
        });
        try {
            // Forward to wallet service for creation of wallet
            if(!process.env.WALLET_SERVICE_URL)
                throw new HttpException("Wallet service URL not defined", 500);
            const url = process.env.WALLET_SERVICE_URL;
            const endpoint = url + `/api/wallet/create`;
            const reqBody = {
                userId: provider.id,
                type: 'PROVIDER',
                credits: 0
            }
            const resp = await axios.post(endpoint, reqBody);
        } catch(err) {
            await this.prisma.provider.delete({
                where: {
                    id: provider.id
                }
            });
            throw new HttpException(err.response || "Wallet service not running", err.response?.status || err.status || 500);
        }
        return provider.id
    }

    async getProviderIdFromLogin(loginDto: LoginDto) {

        // Fetch the provider from email ID
        const provider = await this.prisma.provider.findUnique({
            where: {
                email: loginDto.email
            }
        });
        if(!provider)
            throw new NotFoundException("provider not found");
        
        // Compare the entered password with the password fetched from database
        const isPasswordValid = await this.authService.comparePasswords(loginDto.password, provider.password);
        
        if(!isPasswordValid)
            throw new BadRequestException("Incorrect password");
        
        return provider.id
    }

    async getProvider(providerId: string) {

        // Fetch provider details using ID
        const provider = await this.prisma.provider.findUnique({
            where: {
                id: providerId
            }
        });
        if(!provider)
            throw new NotFoundException("provider does not exist");
        
        const { password, ...clone } = provider;
        return clone;
    }

    async checkProviderFromEmail(email: string): Promise<CheckRegResponseDto> {

        // Fetch provider details using email ID
        const provider = await this.prisma.provider.findUnique({
            where: {
                email
            }
        });
        if(!provider)
            return { found: false }

        return { found: true };
    }

    // Used when provider makes a request to update profile
    async updateProfileInfo(providerId: string, updateProfileDto: UpdateProfileDto) {

        await this.prisma.provider.update({
            where: {
                id: providerId
            },
            data: updateProfileDto
        })
    }

    // Used when admin makes a request to update provider profile
    async editProviderProfileByAdmin(profileInfo: EditProvider) {
        
        return this.prisma.provider.update({
            where: { id: profileInfo.id },
            data: profileInfo
        });
    }

    async addNewCourse(providerId: string, addCourseDto: AddCourseDto): Promise<ProviderCourseResponse> {

        // Fetch provider
        const provider = await this.getProvider(providerId);

        // Check verification
        if(provider.status != ProviderStatus.VERIFIED)
            throw new UnauthorizedException("Provider account is not verified");

        // Forward to course service
        const {cqfScore, impactScore, ...clone} = await this.courseService.addCourse(providerId, addCourseDto);
        return clone;
    }

    async removeCourse(providerId: string, courseId: number) {

        // Validate course ID provided
        const course = await this.courseService.getCourse(courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");
        
        // Forward to course service
        await this.courseService.deleteCourse(courseId);
    }

    async getCourses(providerId: string): Promise<ProviderCourseResponse[]> {

        return this.courseService.getProviderCourses(providerId);
    }

    async editCourse(providerId: string, courseId: number, editCourseDto: EditCourseDto) {
        
        // Validate provider
        await this.getProvider(providerId);

        return this.courseService.editCourse(courseId, editCourseDto);
    }

    async changeCourseStatus(providerId: string, courseId: number, courseStatusDto: CourseStatusDto) {
        
        // Validate provider
        await this.getProvider(providerId);

        return this.courseService.changeStatus(courseId, providerId, courseStatusDto);
    }

    async getCourseFeedbacks(providerId: string, courseId: number): Promise<FeedbackResponseDto> {

        // Fetch course
        const course = await this.courseService.getCourse(courseId);
        
        // Validate course with provider
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");
        
        // Forward to course service
        const userCourses =  await this.courseService.getPurchasedUsersByCourseId(courseId);

        // Construction of DTO required for response
        let feedbacks: Feedback[] = [];
        for(let u of userCourses) {
            if(u.feedback && u.rating) {
                feedbacks.push({
                    feedback: u.feedback,
                    rating: u.rating
                })
            }
        }
        return {
            numberOfPurchases: userCourses.length,
            feedbacks
        };
    }

    async getCourseTransactions(providerId: string): Promise<CourseTransactionDto[]> {

        return this.courseService.getCourseTransactions(providerId)
    }

    async markCourseComplete(providerId: string, completeCourseDto: CompleteCourseDto) {

        // Validate course ID provided
        const course = await this.courseService.getCourse(completeCourseDto.courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");

        // Forward to course service. Error is thrown when user has not purchased a course
        try {
            await this.courseService.markCourseComplete(completeCourseDto);
        } catch {
            throw new NotFoundException("This user has not subscribed to this course");
        }
    }

    async fetchAllProviders(): Promise<ProviderProfileResponse[]> {

        const providers =  await this.prisma.provider.findMany();

        return providers.map((p) => {
            return {
                id: p.id,
                name: p.name,
                email: p.email,
                paymentInfo: (typeof p.paymentInfo === "string") ? JSON.parse(p.paymentInfo) : p.paymentInfo ?? undefined,
                rejectionReason: p.rejectionReason,
                status: p.status,
                orgLogo: p.orgLogo,
                orgName: p.orgName,
                phone: p.phone,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }
        })
    }

    async fetchProvidersForSettlement(): Promise<ProviderSettlementDto[]> {

        const providers = await this.prisma.provider.findMany({
            select: {
                id: true,
                orgLogo: true,
                orgName: true,
                courses: {
                    select: {
                        userCourses: {
                            select: {
                                userId: true
                            }
                        }
                    },
                }
            }
        });
        const results = providers.map(async (provider): Promise<ProviderSettlementDto> => {
            const providerId = provider.id;
            const courses = provider.courses;
            const activeUsers = new Set();
            courses.forEach((c) => {
                c.userCourses.forEach((uc) => {
                    activeUsers.add(uc.userId);
                })
            })
            return {
                id: providerId,
                name: provider.orgName,
                imgLink: provider.orgLogo,
                totalCourses: courses.length,
                activeUsers: activeUsers.size
            }
        })
        return Promise.all(results);
    }

    async verifyProvider(providerId: string) {

        // Fetch provider
        let providerInfo = await this.getProvider(providerId);

        // Check if provider verification is pending
        if(providerInfo.status != ProviderStatus.PENDING) {
            throw new NotAcceptableException(`Provider is either verified or rejected.`);
        }
        // Update the status in database
        return this.prisma.provider.update({ 
            where:    {id: providerId},
            data:  {
                status: ProviderStatus.VERIFIED,
                updatedAt: new Date()
            } 
        });
    }

    async rejectProvider(providerId: string, rejectionReason: string) {

        // Fetch provider
        let providerInfo = await this.getProvider(providerId);

        // Check if provider verification is pending
        if(providerInfo.status != ProviderStatus.PENDING) {
            throw new NotAcceptableException(`Provider is either already accepted or rejected`);
        }
        // Update the status in database
        return this.prisma.provider.update({
            where: {id: providerId},
            data: {
                status: ProviderStatus.REJECTED,
                rejectionReason: rejectionReason,
                updatedAt: new Date()
            }
        });
    }

    async updateProviderPassword(
        providerId: string,
        updatePasswordDto: UpdatePasswordDto
      ) {
        // validate the prrovider
        const provider = await this.getProvider(providerId);
    
        // Compare the entered old password with the password fetched from database
        const isPasswordValid = await this.authService.comparePasswords(
          updatePasswordDto.oldPassword,
          provider.password
        );
    
        if (!isPasswordValid) throw new BadRequestException("Incorrect password");
        // Hashing the password
        const hashedPassword = await this.authService.hashPassword(
          updatePasswordDto.newPassword
        );
        // Updating the password to the newly generated one
        return this.prisma.provider.update({
          where: {
            id: providerId,
          },
          data: {
            password: hashedPassword,
          },
        });
      }
}