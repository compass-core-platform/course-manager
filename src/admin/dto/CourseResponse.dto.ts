import { CourseStatus, CourseVerificationStatus } from "@prisma/client";

export class CourseResponse {
    readonly id: number;
    readonly providerId: number;
    readonly title: string;
    readonly description: string;
    readonly courseLink: string;
    readonly imgLink: string;
    readonly credits: number;
    readonly noOfLessons: number;
    readonly language: string[];
    readonly duration: number;
    readonly competencies: JSON;
    readonly author: string;
    readonly avgRating: number;
    readonly status: CourseStatus;
    readonly availabilityTime: Date;
    readonly verificationStatus: CourseVerificationStatus;
    readonly cqf_score: number;
    readonly impact_score: number;
}