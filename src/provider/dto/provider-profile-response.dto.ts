import { ApiProperty } from "@nestjs/swagger";
import { ProviderStatus } from "@prisma/client";
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';


export class ProviderProfileResponse {
    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    id: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({format: 'email'})
    @IsEmail()
    @IsOptional()
    email: string;
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    walletId: number;

    @ApiProperty()
    @IsOptional()
    paymentInfo: any;

    @ApiProperty()
    @IsOptional()
    @IsEnum(ProviderStatus)
    status: ProviderStatus;
    // readonly courses: Course[];
}