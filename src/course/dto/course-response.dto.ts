import { CourseStatus, CourseVerificationStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { CompetencyMap } from "src/utils/types";

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
    readonly availabilityTime: Date | null;
    readonly verificationStatus: CourseVerificationStatus;
    readonly rejectionReason: string | null;
}

export class AdminCourseResponse extends CourseResponse {

    readonly cqfScore: number | null;
    readonly impactScore: number | null;
}