import { CourseStatus, CourseVerificationStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

export class CourseResponse {

    readonly id: number;
    readonly providerId: string;
    readonly title: string;
    readonly description: string;
    readonly courseLink: string;
    readonly imgLink: string;
    readonly credits: number;
    readonly noOfLessons: number | null;
    readonly language: string[];
    readonly duration: number;
    readonly competency: JsonValue;
    readonly author: string;
    readonly avgRating: number | null;
    readonly status: CourseStatus;
    readonly startDate: Date | null;
    readonly endDate: Date | null;
}

export class ProviderCourseResponse extends CourseResponse {
    readonly verificationStatus: CourseVerificationStatus;
    readonly rejectionReason: string | null;
}

export class AdminCourseResponse extends ProviderCourseResponse {

    readonly cqfScore: number | null;
    readonly impactScore: number | null;
}