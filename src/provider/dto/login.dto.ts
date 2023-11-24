import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CheckRegDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string
}

export class CheckRegResponseDto {
    readonly found: boolean
}

export class LoginDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsNotEmpty({ message: 'Password is required' })
    password: string
}

export class LoginResponseDto {

    // provider ID
    readonly providerId: string
}