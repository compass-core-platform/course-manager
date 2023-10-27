
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, ProviderStatus, Course, CourseVerificationStatus } from '@prisma/client';
import { omit } from 'lodash';
import { EditProvider } from './dto/edit-provider.dto';

@Injectable()
export class AdminService {

    constructor(private prisma: PrismaService) {}

    async verifyProvider(providerId: number) {
        let providerInfo = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });

        if(!providerInfo) {
            throw new NotFoundException(`Provider with id ${providerId} does not exist`);
        }

        if(providerInfo.status != ProviderStatus.pending) {
            throw new HttpException(`Provider is either verified or rejected.`, 406);
        }

        const updatedRecord = await this.prisma.provider.update({ 
            where:    {id: providerId},
            data:  {status: ProviderStatus.verified} 
        });
        return updatedRecord;
    }

    async findAllProviders(): Promise<Partial<Provider>[]> {
        let providers = await this.prisma.provider.findMany({
            select: { id: true, name: true, email: true, walletId: true, paymentInfo: true, courses: true, status: true}
        });
        return providers;
    }

    async findProviderById(providerId: number): Promise<Provider> {
        let provider = await this.prisma.provider.findFirst({
            where: {id: providerId}
        });

        if(!provider) {
            throw new NotFoundException(`Provider with id ${providerId} does not exist`);
        }

        return provider;
    }

    async findAllCourses() : Promise<Course[]> {
        let courses = this.prisma.course.findMany();
        return courses;
    }

    async findCourseById(courseId: number) {
        let course = await this.prisma.course.findUnique({
            where: { id: courseId }
        });
        if(!course) {
            throw new NotFoundException(`Course with id ${courseId} not found`);
        }
        return course;
    }

    async acceptCourse(courseId: number, cqf_score: number) {
        let course = await this.prisma.course.findUnique({
            where: { id: courseId }
        });
        if(!course) {
            throw new NotFoundException(`Course with id ${courseId} not found`);
        }
        if(course.verificationStatus != CourseVerificationStatus.pending) {
            throw new HttpException(`Course is either rejected or is already accepted.`, 406);
        }
        let updatedCourse = await this.prisma.course.update({
            where: { id: courseId },
            data: {
                verificationStatus: CourseVerificationStatus.accepted,
                cqfScore: cqf_score
            }
        });
        return updatedCourse;
    }

    async rejectCourse(courseId: number) {
        let course = await this.prisma.course.findUnique({
            where: { id: courseId }
        });
        if(!course) {
            throw new NotFoundException(`Course with id ${courseId} not found`);
        }
        let updatedCourse = await this.prisma.course.update({
            where: {id: courseId},
            data: {verificationStatus: CourseVerificationStatus.rejected}
        });
        return updatedCourse;
    }

    async removeCourse(courseId: number) {
        let course = await this.prisma.course.findUnique({
            where: { id: courseId }
        });
        if(!course) {
            throw new NotFoundException(`Course with id ${courseId} not found`);
        }
        await this.prisma.course.delete({
            where: {id: courseId}
        });
    }

    async getTransactions(adminId: number): Promise<any> {

        const walletService = process.env.MOCK_WALLET_SERVICE_URL;
        const endpoint = `${adminId}/transactions/consumers`;
        const url = walletService + endpoint;

        try {
            const response: AxiosResponse = await axios.get(url);
            return response.data;
    
        } catch (err) {
            throw new Error(`Failed to fetch data: ${err.message}`);
        }
    }

    async addOrRemoveCreditsToProvider(adminId: number, providerId: number, credits: number) {
        const walletService = process.env.MOCK_WALLET_SERVICE_URL;
        let endpoint: string;
        if(credits >= 0) {
            endpoint = `${adminId}/add-credits`;
        } else {
            endpoint = `${adminId}/reduce-credits`;
        }
        const url = walletService + endpoint;
        const requestBody = {
            consumerId: providerId,
            credits: credits
        };
        try {
            const response = await axios.post(url, requestBody);
            return response;
        } catch (err) {
            throw new Error(`Failed to send POST request to walletService.`);
        }
    }

    async editProviderProfile(profileInfo: EditProvider) {
        
        const updatedProfile = await this.prisma.provider.update({
            where: { id: profileInfo.id },
            data: profileInfo
        });

        return updatedProfile;
    }

}

