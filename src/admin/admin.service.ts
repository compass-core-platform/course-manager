
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

    // verify provider account
    async verifyProvider(providerId: string) {

        return this.providerService.verifyProvider(providerId);
    }

    // reject provider account
    async rejectProvider(providerId: string, rejectionReason: string) {
        return this.providerService.rejectProvider(providerId, rejectionReason);
    }

    // fetch all providers on marketplace
    async findAllProviders(): Promise<Partial<Provider>[]> {

        return this.providerService.fetchAllProviders();
    }

    // fetch provider with the given id
    async findProviderById(providerId: string): Promise<Provider> {

        return this.providerService.getProvider(providerId);
    }

    // fetch all courses added onto the marketplace
    async findAllCourses() : Promise<Course[]> {

        return this.courseService.fetchAllCourses();
    }

    // find course by Id
    async findCourseById(courseId: number) {

        return this.courseService.getCourse(courseId);
    }

    // accept a course along with the cqf score
    async acceptCourse(courseId: number, cqf_score: number) {
        
        return this.courseService.acceptCourse(courseId, cqf_score);
    }

    // reject a course
    async rejectCourse(courseId: number, rejectionReason: string) {
        
        return this.courseService.rejectCourse(courseId, rejectionReason);
    }

    // remove a course from marketplace
    async removeCourse(courseId: number) {
        
        return this.courseService.removeCourse(courseId);
    }

    // get all admin-consumer transactions
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

    // Add or remove credits to provider wallet
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

    // edit provider profile information
    async editProviderProfile(profileInfo: EditProvider) {
        
        return this.providerService.editProviderProfileByAdmin(profileInfo);
    }

    // Get number of course purchases for a provider
    async getNoOfCoursePurchasesForProvider(providerId: string) {
        return await this.prisma.userCourse.count({
            where: { 
                course: {
                    providerId: providerId
                }
            }
        });
    }

    // Get the number of courses added by a provider
    async getNumberOfCoursesForProvider(providerId: string) {
        return await this.prisma.course.count({
            where: {
                providerId: providerId
            }
        });
    }

    // Get the number of credits in a provider wallet
    async getProviderWalletCredits(providerId: string) {
        const url = process.env.WALLET_SERVICE_URL;
        const endpoint = url + `/api/providers/${providerId}/credits`;
        const resp = await axios.get(endpoint);
        return resp.data.credits;
    }

    // Get all the providers information for settlement
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

    // settle credits for a provider
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

