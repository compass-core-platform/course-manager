
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, Course } from '@prisma/client';
import { EditProvider } from './dto/edit-provider.dto';
import { MockWalletService } from '../mock-wallet/mock-wallet.service';
import { ProviderService } from 'src/provider/provider.service';
import { CourseService } from 'src/course/course.service';
import axios from 'axios';

@Injectable()
export class AdminService {

    constructor(
        private prisma: PrismaService, 
        private wallet: MockWalletService, 
        private providerService: ProviderService,
        private courseService: CourseService
    ) {}

    async verifyProvider(providerId: string) {

        return this.providerService.verifyProvider(providerId);
    }

    async findAllProviders(): Promise<Partial<Provider>[]> {

        return this.providerService.fetchAllProviders();
    }

    async findProviderById(providerId: string): Promise<Provider> {

        return this.providerService.getProvider(providerId);
    }

    async findAllCourses() : Promise<Course[]> {

        return this.courseService.fetchAllCourses();
    }

    async findCourseById(courseId: number) {

        return this.courseService.getCourse(courseId);
    }

    async acceptCourse(courseId: number, cqf_score: number) {
        
        return this.courseService.acceptCourse(courseId, cqf_score);
    }

    async rejectCourse(courseId: number) {
        
        return this.courseService.rejectCourse(courseId);
    }

    async removeCourse(courseId: number) {
        
        return this.courseService.removeCourse(courseId);
    }

    async getTransactions(adminId: string) {

        const walletService = process.env.WALLET_SERVICE_URL;
        const endpoint = `/admin/${adminId}/transactions/consumers`;
        const url = walletService + endpoint;
        try {
            const response = await axios.get(url);
            return response.data;
    
        } catch (err) {
            throw new Error(`Failed to fetch data: ${err.message}`);
        }
    }

    async addOrRemoveCreditsToProvider(adminId: string, providerId: string, credits: number) {
        const walletService = process.env.WALLET_SERVICE_URL;
        let endpoint: string;
        if(credits >= 0) {
            endpoint = `/admin/${adminId}/add-credits`;
        } else {
            endpoint = `/admin/${adminId}/reduce-credits`;
        }
        const url = walletService + endpoint;
        const requestBody = {
            consumerId: providerId,
            credits: credits
        };
        try {
            let response = await axios.post(url, requestBody);
            return response;
        } catch (err) {
            throw new Error(`Failed to send add/reduce credits POST request to walletService.`);
        }
    }

    async editProviderProfile(profileInfo: EditProvider) {
        
        return this.providerService.editProviderProfileByAdmin(profileInfo);
    }

    async getNoOfCoursePurchasesForProvider(providerId: string) {
        return await this.prisma.userCourse.count({
            where: { 
                course: {
                    providerId: providerId
                }
            }
        });
    }

    async getNumberOfCoursesForProvider(providerId: string) {
        return await this.prisma.course.count({
            where: {
                providerId: providerId
            }
        });
    }

    async getProviderWalletCredits(providerId: string) {
        const url = process.env.WALLET_SERVICE_URL;
        const endpoint = url + `/api/providers/${providerId}/credits`;
        const resp = await axios.get(endpoint);
    }

    async getAllProviderInfoForSettlement() {
        
        const providers = await this.providerService.fetchAllProviders();
        const results = providers.map(async (provider) => {
            const providerId = provider.id;
            return {
                id: providerId,
                name: provider.name,
                numberOfCourses: await this.getNumberOfCoursesForProvider(providerId),
                activeUsers: await this.getNoOfCoursePurchasesForProvider(providerId),
                totalCredits: await this.getProviderWalletCredits(providerId)
            }
        });
        return results;
    }

    async settleCredits(adminId: string, providerId: string) {
        // Need to add transaction, add paymentReceipt additional settlement processing
        // then set the credits of the provider to 0
        const totCredits = await this.getProviderWalletCredits(providerId);
        const url = process.env.WALLET_SERVICE_URL;
        const endpoint = url + `/api/providers/${providerId}/settlement-transaction`;
        const reqBody = {
            adminId: adminId,
            credits: totCredits
        };
        const response = await axios.post(endpoint, reqBody);
        return;
    }

}

