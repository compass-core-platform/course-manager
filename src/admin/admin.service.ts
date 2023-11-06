
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider, ProviderStatus, Course, CourseVerificationStatus } from '@prisma/client';
import { EditProvider } from './dto/edit-provider.dto';
import { MockWalletService } from '../mock-wallet/mock-wallet.service';

@Injectable()
export class AdminService {

    constructor(private prisma: PrismaService, private wallet: MockWalletService) {}

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
        
        const updatedProfile = await this.prisma.provider.update({
            where: { id: profileInfo.id },
            data: profileInfo
        });

        return updatedProfile;
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
        
        const providers = await this.prisma.provider.findMany({});
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

