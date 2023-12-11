
import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
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
import { AdminSignupDto } from './dto/signup.dto';
import { uploadFile } from 'src/utils/minio';
import { AuthService } from 'src/auth/auth.service';
import { AdminLoginDto } from './dto/login.dto';

@Injectable()
export class AdminService {

    constructor(
        private prisma: PrismaService,
        private providerService: ProviderService,
        private courseService: CourseService,
        private authService: AuthService
    ) {}

    // create a new admin
    async signup(signupDto: AdminSignupDto, image?: Express.Multer.File) {

        let imageUrl: string | undefined;
        if(image) {
            const imageName = signupDto.name.replaceAll(" ", "_")
            imageUrl = await uploadFile(`admin/${imageName}`, image.buffer)
        }

        // Hashing the password
        const hashedPassword = await this.authService.hashPassword(signupDto.password);

        const admin = await this.prisma.admin.create({
            data: {
                name: signupDto.name,
                email: signupDto.email,
                password: hashedPassword,
                image: imageUrl
            }
        });
        try {
            // Forward to wallet service for creation of wallet
            if(!process.env.WALLET_SERVICE_URL)
                throw new HttpException("Wallet service URL not defined", 500);
            
            const url = process.env.WALLET_SERVICE_URL;
            const endpoint = url + `/api/wallet/create`;
            const reqBody = {
                userId: admin.id,
                type: 'ADMIN',
                credits: 0
            }
            await axios.post(endpoint, reqBody);
        } catch(err) {
            await this.prisma.admin.delete({
                where: {
                    id: admin.id
                }
            });
            throw new HttpException(err.response || "Wallet service not running", err.response?.status || err.status || 500);
        }
        try {
            // Forward to marketplace portal for creation in marketplace
            if(!process.env.MARKETPLACE_PORTAL_URL)
                throw new HttpException("Marketplace service URL not defined", 500);

            const url = process.env.MARKETPLACE_PORTAL_URL;
            const endpoint = url + `/api/admin/${admin.id}`;

            await axios.post(endpoint);
        } catch(err) {
            await this.prisma.admin.delete({
                where: {
                    id: admin.id
                }
            });
            throw new HttpException(err.response || "Marketplace service not running", err.response?.status || err.status || 500);
        }

        return admin;
    }

    async login(loginDto: AdminLoginDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: loginDto.email }
        });
        if (admin == null) {
            throw new NotFoundException(`Admin not found`);
        }
        const isMatch = await this.authService.comparePasswords(loginDto.password, admin.password);
        if (!isMatch) {
            throw new BadRequestException(`Invalid credentials`);
        }
        return admin;
    }

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
    async findCourseById(courseId: string): Promise<AdminCourseResponse> {

        return this.courseService.getCourse(courseId);
    }

    // accept a course along with the cqf score
    async acceptCourse(courseId: string, cqf_score?: number) {
        
        return this.courseService.acceptCourse(courseId, cqf_score);
    }

    // reject a course
    async rejectCourse(courseId: string, rejectionReason: string) {
        
        return this.courseService.rejectCourse(courseId, rejectionReason);
    }

    // remove a course from marketplace
    async removeCourse(courseId: string) {
        
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

