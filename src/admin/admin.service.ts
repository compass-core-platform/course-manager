
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, ProviderStatus, Course, CourseVerificationStatus } from '@prisma/client';
import { EditProvider } from './dto/edit-provider.dto';
import { MockWalletService } from '../mock-wallet/mock-wallet.service';
import { ProviderService } from 'src/provider/provider.service';
import { CourseService } from 'src/course/course.service';

@Injectable()
export class AdminService {

    constructor(
        private prisma: PrismaService, 
        private wallet: MockWalletService, 
        private providerService: ProviderService,
        private courseService: CourseService
    ) {}

    async verifyProvider(providerId: number) {

        return this.providerService.verifyProvider(providerId);
    }

    async findAllProviders(): Promise<Partial<Provider>[]> {

        return this.providerService.fetchAllProviders();
    }

    async findProviderById(providerId: number): Promise<Provider> {

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

    async getTransactions(adminId: number) {

        // const walletService = process.env.WALLET_SERVICE_URL;
        // const endpoint = `/admin/${adminId}/transactions/consumers`;
        // const url = walletService + endpoint;

        try {
            // const response: AxiosResponse = await axios.get(url);
            const transactions =  this.wallet.getTransactions(adminId);
            return transactions.data;
    
        } catch (err) {
            throw new Error(`Failed to fetch data: ${err.message}`);
        }
    }

    async addOrRemoveCreditsToProvider(adminId: number, providerId: number, credits: number) {
        // const walletService = process.env.WALLET_SERVICE_URL;
        // let endpoint: string;
        // if(credits >= 0) {
        //     endpoint = `/admin/${adminId}/add-credits`;
        // } else {
        //     endpoint = `/admin/${adminId}/reduce-credits`;
        // }
        // const url = walletService + endpoint;
        // const requestBody = {
        //     consumerId: providerId,
        //     credits: credits
        // };
        try {
            // const response = await axios.post(url, requestBody);
            let response;
            if(credits >= 0) {
                response = this.wallet.addCredits(adminId, providerId, credits);
            } else {
                response = this.wallet.reduceCredits(adminId, providerId, credits);
            }
            return response;
        } catch (err) {
            throw new Error(`Failed to send POST request to walletService.`);
        }
    }

    async editProviderProfile(profileInfo: EditProvider) {
        
        return this.providerService.editProviderProfileByAdmin(profileInfo);
    }

    async getNoOfCoursePurchasesForProvider(providerId: number) {
        return await this.prisma.userCourse.count({
            where: { 
                course: {
                    providerId: providerId
                }
            }
        });
    }

    async getNumberOfCoursesForProvider(providerId: number) {
        return await this.prisma.course.count({
            where: {
                providerId: providerId
            }
        });
    }

    async getProviderWalletCredits(providerId: number) {
        const providerWallet = await this.prisma.wallet.findFirst({
            where: {
                provider: {
                    id: providerId
                }
            }
        });

        return providerWallet?.credits;
    }

    async getAllProviderInfoForSettlement() {
        
        const providers = await this.providerService.fetchAllProviders();
        const results = providers.map((provider) => {
            const providerId = provider.id;
            return {
                id: providerId,
                name: provider.name,
                numberOfCourses: this.getNumberOfCoursesForProvider(providerId),
                activeUsers: this.getNoOfCoursePurchasesForProvider(providerId),
                totalCredits: this.getProviderWalletCredits(providerId)
            }
        });
        return results;
    }

    async settleCredits(providerId: number) {
        // Need to add transaction, add paymentReceipt additional settlement processing
        // then set the credits of the provider to 0
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                provider: {
                    id: providerId
                }
            }
        });

        const updatedWallet = await this.prisma.wallet.update({
            where: {
                walletId: wallet?.walletId
            },
            data: {
                credits: 0
            }
        });
        return updatedWallet;
    }

}

