import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

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
    password: string;

    // organisation name
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    orgName: string;

    // phone number
    @ApiProperty()
    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;

    // payment info
    @ApiProperty()
    @IsOptional()
    @IsString()
    paymentInfo?: string
}

export class SignupResponseDto {

    // provider ID
    readonly providerId: string
}