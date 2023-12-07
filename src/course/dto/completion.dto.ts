import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsUUID, Min } from "class-validator";


export class CompleteCourseDto {

    // course ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    courseId: string;

    // user ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    // Course completion score
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    courseCompletionScore: number;
}