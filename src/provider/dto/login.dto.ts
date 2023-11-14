import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class LoginDto {

    // email ID
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string

    // password
    @ApiProperty()
    @IsNotEmpty({ message: 'Password is required' })
    @IsStrongPassword()
    password: string
}

export class LoginResponseDto {

    // provider ID
    readonly providerId: string
}