import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsUUID } from "class-validator";


export class CompleteCourseDto {

    // course ID
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    courseId: number;

    // user ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}