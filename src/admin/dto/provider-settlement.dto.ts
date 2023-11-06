import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from 'class-validator';


export class ProviderSettlementDto {
    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    imgLink: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    totalCourses: number;
    
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    activeUsers: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    totalCredits: number;

}