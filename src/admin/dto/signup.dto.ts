import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class AdminSignupDto {

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
    // A strong password should have a minimum length of 8 characters,
    // at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.
    @IsNotEmpty({ message: 'Password is required' })
    @IsStrongPassword(
        {
            minLength: 8,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        { message: 'Password is not strong enough' },
    )
    password: string
}