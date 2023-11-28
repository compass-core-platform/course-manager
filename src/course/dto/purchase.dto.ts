import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsString, IsUUID } from "class-validator";


export class PurchaseDto {
    // consumer ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    consumerId: string;

    // provider ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    providerId: string;

    // Number of credits transferred
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    credits: number;

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