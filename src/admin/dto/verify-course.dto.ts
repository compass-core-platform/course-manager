import { CourseVerificationStatus } from "@prisma/client";

export class CourseVerify {
    readonly cqf_score: number;
    readonly verificationStatus: CourseVerificationStatus;
}