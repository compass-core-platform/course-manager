import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProviderStatus, WalletType } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddCourseDto } from 'src/course/dto/add-course.dto';
import { CourseService } from 'src/course/course.service';
import { Feedback, FeedbackResponseDto } from './dto/feedback.dto';
import { PurchaseResponseDto } from './dto/purchase.dto';
import { CourseResponseDto } from 'src/course/dto/course.dto';
import { CompleteCourseDto } from 'src/course/dto/completion.dto';

@Injectable()
export class ProviderService {
    constructor(
        private prisma: PrismaService,
        private courseService: CourseService
    ) {}

    async createNewAccount(signupDto: SignupDto) {

        const provider = await this.prisma.provider.create({
            data: {
                ...signupDto,
                wallet: {
                    create: {
                        type: WalletType.provider,
                    }
                }
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

    async getProvider(providerId: number) {

        const provider = await this.prisma.provider.findUnique({
            where: {
                id: providerId
            }
        });
        if(!provider)
            throw new NotFoundException("provider does not exist");
        
        return provider;
    }

    async updateProfileInfo(providerId: number, updateProfileDto: UpdateProfileDto) {

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

    async addNewCourse(providerId: number, addCourseDto: AddCourseDto) {

        const provider = await this.getProvider(providerId);

        if(provider.status != ProviderStatus.verified)
            throw new UnauthorizedException("Provider account is not verified");

        return this.courseService.addCourse(providerId, addCourseDto);
    }

    async removeCourse(providerId: number, courseId: number) {

        const course = await this.courseService.getCourse(courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
        if(course.providerId != providerId)
            throw new BadRequestException("Course does not belong to this provider");
        
        await this.courseService.deleteCourse(courseId);
    }

    async getCourses(providerId: number): Promise<CourseResponseDto[]> {

        return this.courseService.getProviderCourses(providerId);
    }

    async getCourseFeedbacks(providerId: number, courseId: number): Promise<FeedbackResponseDto> {

        const course = await this.courseService.getCourse(courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
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

    async getCoursePurchases(providerId: number, courseId: number): Promise<PurchaseResponseDto[]> {

        const course = await this.courseService.getCourse(courseId);
        if(!course)
            throw new NotFoundException("Course does not exist");
        
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

    async markCourseComplete(providerId: number, completeCourseDto: CompleteCourseDto) {

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
}