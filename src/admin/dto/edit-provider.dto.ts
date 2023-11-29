import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsObject, IsOptional, IsPhoneNumber, IsString, IsUUID, IsUrl } from "class-validator";
import { ProviderStatus } from "@prisma/client";
import { PaymentInfo } from "src/utils/types";


export class EditProvider {
    @ApiProperty({required: false})
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({format: 'email'})
    @IsEmail()
    @IsOptional()
    email?: string;

    // organisation name
    @ApiProperty()
    @IsOptional()
    @IsString()
    orgName?: string;

    // organisation logo image link
    @ApiProperty()
    @IsOptional()
    @IsUrl()
    orgLogo?: string;

    // phone number
    @ApiProperty()
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @ApiProperty()
    @IsOptional()
    @IsObject()
    paymentInfo?: PaymentInfo;

    @ApiProperty()
    @IsOptional()
    @IsEnum(ProviderStatus)
    status?: ProviderStatus;

    @ApiProperty()
    @IsOptional()
    @IsString()
    rejectionReason?: string | null;
    // readonly courses: Course[];
}