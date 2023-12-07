import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AdminLoginDto {

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
}

export class AdminLoginResponseDto {

    // provider ID
    readonly adminId: number
    readonly name: string
    readonly image: string
}