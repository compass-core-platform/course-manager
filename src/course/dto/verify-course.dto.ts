import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';


export class CourseVerify {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    cqf_score?: number;
}