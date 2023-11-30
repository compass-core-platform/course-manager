import { ApiProperty } from "@nestjs/swagger";
import { ProviderStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { IsEmail, IsEnum, IsObject, IsOptional as IsNotEmpty, IsString, IsUUID, IsOptional, IsUrl, IsPhoneNumber, IsDate } from 'class-validator';

export class ProviderProfileResponse {
    @ApiProperty({required: false})
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({format: 'email'})
    @IsEmail()
    @IsNotEmpty()
    email: string;

    // organisation name
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    orgName: string;

    // organisation logo image link
    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    orgLogo: string;

    // phone number
    @ApiProperty()
    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;

    @ApiProperty()
    @IsOptional()
    @IsObject()
    paymentInfo: JsonValue;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(ProviderStatus)
    status: ProviderStatus;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    rejectionReason: string | null;
    // readonly courses: Course[];

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    createdAt: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    updatedAt: Date;
}