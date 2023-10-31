import { $Enums, Prisma } from "@prisma/client";

export class CourseResponseDto {

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
    readonly competency: Prisma.JsonValue;
    readonly author: string;
    readonly avgRating: number | null;
    readonly status: $Enums.CourseStatus;
    readonly availabilityTime: Date | null;
    readonly verificationStatus: $Enums.CourseVerificationStatus;
}