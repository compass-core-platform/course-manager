import { BadRequestException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Provider, ProviderStatus } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddCourseDto } from 'src/course/dto/add-course.dto';
import { CourseService } from 'src/course/course.service';
import { Feedback, FeedbackResponseDto } from './dto/feedback.dto';
import { PurchaseResponseDto } from './dto/purchase.dto';
import { CompleteCourseDto } from 'src/course/dto/completion.dto';
import { EditCourseDto } from 'src/course/dto/edit-course.dto';
import { EditProvider } from 'src/admin/dto/edit-provider.dto';
import { CourseResponse } from 'src/course/dto/course-response.dto';
import { ProviderProfileResponse } from './dto/provider-profile-response.dto';
import axios from 'axios';

@Injectable()
export class ProviderService {
    constructor(
        private prisma: PrismaService,
        private courseService: CourseService
    ) {}

    async createNewAccount(signupDto: SignupDto) {

        let provider = await this.prisma.provider.findUnique({
            where : {
                email: signupDto.email
            }
        })
        if(provider)
            throw new BadRequestException("Account with that email ID already exists");

        // update the endpoint 
        const url = process.env.WALLET_SERVICE_URL;
        const endpoint = url + `/admin/:adminId/providers/create`;
        const resp = await axios.post(endpoint);

        provider = await this.prisma.provider.create({
            data: {
                ...signupDto,
                walletId: resp.data.walletId
            }
        })
        return provider.id
    }

    async getProviderIdFromLogin(loginDto: LoginDto) {

        const provider = await this.prisma.provider.findUnique({
            where: {
                email: loginDto.email
            }
        })
        if(!provider)
            throw new NotFoundException("Email ID does not exist");
        
        if(provider.password != loginDto.password)
            throw new BadRequestException("Incorrect password");
        
        return provider.id
    }

    async getProvider(providerId: string) {

        const provider = await this.prisma.provider.findUnique({
            where: {
                id: providerId
            }
        });
        if(!provider)
            throw new NotFoundException("provider does not exist");
        
        return provider;
    }

    async updateProfileInfo(providerId: string, updateProfileDto: UpdateProfileDto) {

        try {
            await this.prisma.provider.update({
                where: {
                    id: providerId
                },
                data: updateProfileDto
            })
        } catch {
            throw new NotFoundException("profile does not exist");
        }
    }

    async editProviderProfileByAdmin(profileInfo: EditProvider) {
        
        return this.prisma.provider.update({
            where: { id: profileInfo.id },
            data: profileInfo
        });
    }

    async addNewCourse(providerId: string, addCourseDto: AddCourseDto) {

        const provider = await this.getProvider(providerId);

        if(provider.status != ProviderStatus.verified)
            throw new UnauthorizedException("Provider account is not verified");

        return this.courseService.addCourse(providerId, addCourseDto);
    }

    async removeCourse(providerId: string, courseId: number) {

        const course = await this.courseService.getCourse(courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");
        
        await this.courseService.deleteCourse(courseId);
    }

    async getCourses(providerId: string): Promise<CourseResponse[]> {

        return this.courseService.getProviderCourses(providerId);
    }

    async editCourse(providerId: string, courseId: number, editCourseDto: EditCourseDto) {
        const course = await this.courseService.editCourse(providerId, courseId, editCourseDto);
        return course;
    }

    async archiveCourse(providerId: string, courseId: number) {
        return this.courseService.archiveCourse(providerId, courseId);
    }

    async getCourseFeedbacks(providerId: string, courseId: number): Promise<FeedbackResponseDto> {

        const course = await this.courseService.getCourse(courseId);
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");
        
        const userCourses =  await this.courseService.getUserCourses(courseId);

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

    async getCoursePurchases(providerId: string, courseId: number): Promise<PurchaseResponseDto[]> {

        const course = await this.courseService.getCourse(courseId);
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");
        
        const userCourses =  await this.courseService.getUserCourses(courseId);

        return userCourses.map((u) => {
            return {
                courseId: u.courseId,
                purchasedAt: u.purchasedAt,
                userId: u.userId
            }
        })

    }

    async markCourseComplete(providerId: string, completeCourseDto: CompleteCourseDto) {

        const course = await this.courseService.getCourse(completeCourseDto.courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");

        try {
            await this.courseService.markCourseComplete(completeCourseDto);
        } catch {
            throw new NotFoundException("This user has not subscribed to this course");
        }
    }

    async fetchAllProviders(): Promise<ProviderProfileResponse[]> {

        return this.prisma.provider.findMany({
            select: { id: true, name: true, email: true, walletId: true, paymentInfo: true, courses: true, status: true}
        });
    }

    async verifyProvider(providerId: string) {
        let providerInfo = await this.getProvider(providerId);

        if(providerInfo.status != ProviderStatus.pending) {
            throw new HttpException(`Provider is either verified or rejected.`, 406);
        }
        return this.prisma.provider.update({ 
            where:    {id: providerId},
            data:  {status: ProviderStatus.verified} 
        });
    }
}