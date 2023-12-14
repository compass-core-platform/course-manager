import { CourseStatus, CourseVerificationStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

export class CourseResponse {

    readonly courseId: string;
    readonly providerId: string;
    readonly title: string;
    readonly description: string;
    readonly imageLink: string;
    readonly credits: number;
    readonly language: string[];
    readonly competency: JsonValue;
    readonly author: string;
    readonly avgRating: number | null;
    readonly status: CourseStatus;
    readonly startDate: Date | null;
    readonly endDate: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly numOfUsers?: number;
    readonly providerName?: string;
}

export class ProviderCourseResponse extends CourseResponse {
    readonly courseLink: string;
    readonly verificationStatus: CourseVerificationStatus;
    readonly rejectionReason: string | null;
}

export class AdminCourseResponse extends ProviderCourseResponse {

    readonly cqfScore: number | null;
    readonly impactScore: number | null;
    readonly providerLogo: string;
}