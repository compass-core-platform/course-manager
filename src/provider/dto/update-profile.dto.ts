import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJSON, IsObject, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { PaymentInfo } from "src/utils/types";

export class UpdateProfileDto {

    // name
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string

    // email ID
    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email?: string

    // organisation name
    @ApiProperty()
    @IsString()
    @IsOptional()
    orgName?: string

    // organisation logo image link
    @ApiProperty()
    @IsString()
    @IsOptional()
    orgLogo?: string

    // phone number
    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone?: string

    // payment info
    @ApiProperty()
    @IsOptional()
    @IsObject()
    paymentInfo?: PaymentInfo
}
