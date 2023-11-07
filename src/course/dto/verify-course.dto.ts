import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from 'class-validator';


export class CourseVerify {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    cqf_score: number;
}