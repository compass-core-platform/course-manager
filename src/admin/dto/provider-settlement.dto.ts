import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';


export class ProviderSettlementDto {
    @ApiProperty({required: false})
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    imgLink?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    totalCourses?: number;
    
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    activeUsers?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    totalCredits?: number;

}