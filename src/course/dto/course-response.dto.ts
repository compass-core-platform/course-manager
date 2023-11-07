import { CourseStatus, CourseVerificationStatus } from "@prisma/client";

export class CourseResponse {

    readonly id: number;
    readonly providerId: number;
    readonly title: string;
    readonly description: string;
    readonly courseLink: string;
    readonly imgLink: string;
    readonly credits: number;
    readonly noOfLessons: number | null;
    readonly language: string[];
    readonly duration: number;
    readonly competency: any;
    readonly author: string;
    readonly avgRating: number | null;
    readonly status: CourseStatus;
    readonly availabilityTime: Date | null;
    readonly verificationStatus: CourseVerificationStatus;
}

export class AdminCourseResponse extends CourseResponse {

    readonly cqfScore: number | null;
    readonly impactScore: number | null;
}