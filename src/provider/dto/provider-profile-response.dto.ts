import { ApiProperty } from "@nestjs/swagger";
import { ProviderStatus } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';


export class ProviderProfileResponse {
    @ApiProperty({required: false})
    @IsUUID()
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
    @IsOptional()
    paymentInfo?: any;

    @ApiProperty()
    @IsOptional()
    @IsEnum(ProviderStatus)
    status?: ProviderStatus;

    @ApiProperty()
    @IsOptional()
    @IsString()
    rejectionReason?: string;
    // readonly courses: Course[];
}