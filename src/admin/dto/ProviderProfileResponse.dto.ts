import { Course, ProviderStatus } from "@prisma/client";

export class ProviderProfileResponse {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly walletId: number;
    readonly paymentInfo: any;
    readonly status: ProviderStatus;
    // readonly courses: Course[];
}