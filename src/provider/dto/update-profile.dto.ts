import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJSON, IsOptional, IsString } from "class-validator";

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

    // password
    @ApiProperty()
    @IsString()
    @IsOptional()
    password?: string

    // payment info
    @ApiProperty()
    @IsOptional()
    paymentInfo?: any
}
