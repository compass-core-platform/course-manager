import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";


export class PurchaseDto {
    // consumer ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    consumerId: string;
}

export class PurchaseResponseDto {
    readonly walletTransactionId: number;
}

export class WalletPurchaseDto {
    readonly providerId: string;
    readonly credits: number;
    readonly description: string;
}