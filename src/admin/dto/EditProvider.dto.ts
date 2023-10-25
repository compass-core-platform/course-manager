import { ProviderStatus } from "@prisma/client";

export class EditProvider {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly walletId: number;
    readonly paymentInfo: any;
    readonly status: ProviderStatus;
}