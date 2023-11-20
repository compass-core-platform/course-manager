import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreditRequest {
    
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    readonly providerId: string

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    readonly credits: number
}