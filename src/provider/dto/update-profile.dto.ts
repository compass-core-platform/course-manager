import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

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

    // phone number
    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone?: string

    // payment info
    @ApiProperty()
    @IsOptional()
    @IsString()
    paymentInfo?: string
}
