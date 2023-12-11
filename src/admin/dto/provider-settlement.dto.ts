import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';


export class ProviderSettlementDto {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsOptional()
    @IsUrl()
    imageLink?: string;

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