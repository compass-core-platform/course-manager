import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, IsUUID } from "class-validator";


export class PurchaseDto {
    // consumer ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    consumerId: string;

    // Purchase description
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    transactionDescription: string;
}

export class PurchaseResponseDto {
    readonly walletTransactionId: number;
}

export class WalletPurchaseDto {
    readonly providerId: string;
    readonly credits: number;
    readonly description: string;
}