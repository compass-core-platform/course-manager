import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignupDto {

    // name
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string

    // email ID
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string

    // password
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string

    // payment info
    @ApiProperty()
    @IsOptional()
    @IsJSON()
    paymentInfo?: any
}

export class SignupResponseDto {

    // provider ID
    readonly providerId: number
}