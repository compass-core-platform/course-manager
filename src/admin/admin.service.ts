
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, Course } from '@prisma/client';
import { EditProvider } from './dto/edit-provider.dto';
import { MockWalletService } from '../mock-wallet/mock-wallet.service';
import { ProviderService } from 'src/provider/provider.service';
import { CourseService } from 'src/course/course.service';
import axios from 'axios';
import { AdminCourseResponse } from 'src/course/dto/course-response.dto';
import { ProviderSettlementDto } from './dto/provider-settlement.dto';
import { ProviderProfileResponse } from 'src/provider/dto/provider-profile-response.dto';

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
    async findProviderById(providerId: string): Promise<ProviderProfileResponse> {

        return this.providerService.getProvider(providerId);
    }

    // fetch all courses added onto the marketplace
    async findAllCourses() : Promise<AdminCourseResponse[]> {

        return this.courseService.fetchAllCourses();
    }

    // find course by Id
    async findCourseById(courseId: number): Promise<AdminCourseResponse> {

        return this.courseService.getCourse(courseId);
    }

    // accept a course along with the cqf score
    async acceptCourse(courseId: number, cqf_score?: number) {
        
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

        if(!process.env.WALLET_SERVICE_URL)
            throw new HttpException("Wallet service URL not defined", 500);
        const walletService = process.env.WALLET_SERVICE_URL;
        const endpoint = `/admin/${adminId}/transactions/consumers`;
        const url = walletService + endpoint;

        const response = await axios.get(url);
        return response.data;
    }

    // Add or remove credits to provider wallet
    async addOrRemoveCreditsToProvider(adminId: string, providerId: string, credits: number) {
        const walletService = process.env.WALLET_SERVICE_URL;
        if(!walletService)
            throw new HttpException("Wallet service URL not defined", 500);
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
        let response = await axios.post(url, requestBody);
        return response;

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
    async getAllProvidersWalletCredits(adminId: string) {
        
        const url = process.env.WALLET_SERVICE_URL;
        if(!url)
            throw new HttpException("Wallet service URL not defined", 500);
        const endpoint = url + `/api/admin/${adminId}/credits/providers`;
        const resp = await axios.get(endpoint);
        const creditsResponse = resp.data.data.credits;
        const creditsMap = {};
        creditsResponse.forEach((c) => {
            creditsMap[c.providerId] = c.credits;
        });
        return creditsMap;
    }

    // Get all the providers information for settlement
    async getAllProviderInfoForSettlement(adminId: string): Promise<ProviderSettlementDto[]> {
        
        const providers = await this.providerService.fetchProvidersForSettlement();
        const creditsMap = await this.getAllProvidersWalletCredits(adminId);

        return providers.map((p) => {
            return {
                ...p,
                totalCredits: creditsMap[p.id]
            }
        });
    }

    // settle credits for a provider
    async settleCredits(adminId: string, providerId: string) {
        // Need to add transaction, add paymentReceipt additional settlement processing
        
        const url = process.env.WALLET_SERVICE_URL;
        if(!url)
            throw new HttpException("Wallet service URL not defined", 500);
        const endpoint = url + `/api/admin/${adminId}/providers/${providerId}/settle-credits`;

        const response = await axios.post(endpoint);
    }

}

