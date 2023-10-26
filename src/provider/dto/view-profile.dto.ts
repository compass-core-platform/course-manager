import { $Enums, Prisma } from "@prisma/client";

export class ViewProfileResponseDto {

    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly walletId: number;
    readonly paymentInfo: Prisma.JsonValue;
    readonly status: $Enums.ProviderStatus;
}
