import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { SignupDto } from "./dto/signup.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { ProviderStatus } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AddCourseDto } from "src/course/dto/add-course.dto";
import { CourseService } from "src/course/course.service";
import { Feedback, FeedbackResponseDto } from "./dto/feedback.dto";
import { CourseTransactionDto } from "../course/dto/transaction.dto";
import { CompleteCourseDto } from "src/course/dto/completion.dto";
import { EditCourseDto } from "src/course/dto/edit-course.dto";
import { EditProvider } from "src/admin/dto/edit-provider.dto";
import { CourseResponse } from "src/course/dto/course-response.dto";
import { ProviderProfileResponse } from "./dto/provider-profile-response.dto";
import { AuthService } from "src/auth/auth.service";
import axios from "axios";
import { UpdatePasswordDto } from "./dto/update-password.dto";

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
      where: {
        email: signupDto.email,
      },
    });

    if (provider)
      throw new BadRequestException(
        "Account with that email ID already exists"
      );

    // Hashing the password
    const hashedPassword = await this.authService.hashPassword(
      signupDto.password
    );

    // Create an entry in the database
    provider = await this.prisma.provider.create({
      data: {
        name: signupDto.name,
        email: signupDto.email,
        password: hashedPassword,
        paymentInfo: signupDto.paymentInfo ? signupDto.paymentInfo : null,
        // other user profile data
      },
    });

    // Forward to wallet service for creation of wallet
    const url = process.env.WALLET_SERVICE_URL;
    const endpoint = url + `/api/wallet/create`;
    const reqBody = {
      userId: provider.id,
      type: "PROVIDER",
    };
    const resp = await axios.post(endpoint, reqBody);

    return provider.id;
  }

  async getProviderIdFromLogin(loginDto: LoginDto) {
    // Fetch the provider from email ID
    const provider = await this.prisma.provider.findUnique({
      where: {
        email: loginDto.email,
      },
    });
    if (!provider) throw new NotFoundException("Email ID does not exist");

    // Compare the entered password with the password fetched from database
    const isPasswordValid = await this.authService.comparePasswords(
      loginDto.password,
      provider.password
    );

    if (!isPasswordValid) throw new BadRequestException("Incorrect password");

    return provider.id;
  }

  async getProvider(providerId: string) {
    // Fetch provider details using ID
    const provider = await this.prisma.provider.findUnique({
      where: {
        id: providerId,
      },
    });
    if (!provider) throw new NotFoundException("provider does not exist");

    return provider;
  }

  // Used when provider makes a request to update profile
  async updateProfileInfo(
    providerId: string,
    updateProfileDto: UpdateProfileDto
  ) {
    await this.prisma.provider.update({
      where: {
        id: providerId,
      },
      data: updateProfileDto,
    });
  }

  // Used when admin makes a request to update provider profile
  async editProviderProfileByAdmin(profileInfo: EditProvider) {
    return this.prisma.provider.update({
      where: { id: profileInfo.id },
      data: profileInfo,
    });
  }

  async addNewCourse(providerId: string, addCourseDto: AddCourseDto) {
    // Fetch provider
    const provider = await this.getProvider(providerId);

    // Check verification
    if (provider.status != ProviderStatus.VERIFIED)
      throw new UnauthorizedException("Provider account is not verified");

    // Forward to course service
    return this.courseService.addCourse(providerId, addCourseDto);
  }

  async removeCourse(providerId: string, courseId: number) {
    // Validate course ID provided
    const course = await this.courseService.getCourse(courseId);
    if (!course) throw new NotFoundException("Course does not exist");

    if (course.providerId != providerId)
      throw new BadRequestException("Course does not belong to this provider");

    // Forward to course service
    await this.courseService.deleteCourse(courseId);
  }

  async getCourses(providerId: string): Promise<CourseResponse[]> {
    return this.courseService.getProviderCourses(providerId);
  }

  async editCourse(
    providerId: string,
    courseId: number,
    editCourseDto: EditCourseDto
  ) {
    // Validate provider
    await this.getProvider(providerId);

    return this.courseService.editCourse(courseId, editCourseDto);
  }

  async archiveCourse(providerId: string, courseId: number) {
    // Validate provider
    await this.getProvider(providerId);

    return this.courseService.archiveCourse(courseId);
  }

  async getCourseFeedbacks(
    providerId: string,
    courseId: number
  ): Promise<FeedbackResponseDto> {
    // Fetch course
    const course = await this.courseService.getCourse(courseId);

    // Validate course with provider
    if (course.providerId != providerId)
      throw new BadRequestException("Course does not belong to this provider");

    // Forward to course service
    const userCourses = await this.courseService.getPurchasedUsersByCourseId(
      courseId
    );

    // Construction of DTO required for response
    let feedbacks: Feedback[] = [];
    for (let u of userCourses) {
      if (u.feedback && u.rating) {
        feedbacks.push({
          feedback: u.feedback,
          rating: u.rating,
        });
      }
    }
    return {
      numberOfPurchases: userCourses.length,
      feedbacks,
    };
  }

  async getCourseTransactions(
    providerId: string
  ): Promise<CourseTransactionDto[]> {
    return this.courseService.getCourseTransactions(providerId);
  }

  async markCourseComplete(
    providerId: string,
    completeCourseDto: CompleteCourseDto
  ) {
    // Validate course ID provided
    const course = await this.courseService.getCourse(
      completeCourseDto.courseId
    );
    if (!course) throw new NotFoundException("Course does not exist");

    if (course.providerId != providerId)
      throw new BadRequestException("Course does not belong to this provider");

    // Forward to course service. Error is thrown when user has not purchased a course
    try {
      await this.courseService.markCourseComplete(completeCourseDto);
    } catch {
      throw new NotFoundException(
        "This user has not subscribed to this course"
      );
    }
  }

  async fetchAllProviders(): Promise<ProviderProfileResponse[]> {
    return this.prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        paymentInfo: true,
        courses: true,
        status: true,
      },
    });
  }

  async verifyProvider(providerId: string) {
    // Fetch provider
    let providerInfo = await this.getProvider(providerId);

    // Check if provider verification is pending
    if (providerInfo.status != ProviderStatus.PENDING) {
      throw new NotAcceptableException(
        `Provider is either verified or rejected.`
      );
    }
    // Update the status in database
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { status: ProviderStatus.VERIFIED },
    });
  }

  async rejectProvider(providerId: string, rejectionReason: string) {
    // Fetch provider
    let providerInfo = await this.getProvider(providerId);

    // Check if provider verification is pending
    if (providerInfo.status != ProviderStatus.PENDING) {
      throw new NotAcceptableException(
        `Provider is either already accepted or rejected`
      );
    }
    // Update the status in database
    return this.prisma.provider.update({
      where: { id: providerId },
      data: {
        status: ProviderStatus.REJECTED,
        rejectionReason: rejectionReason,
      },
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
