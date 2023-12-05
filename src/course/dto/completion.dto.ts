import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsUUID } from "class-validator";


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
}