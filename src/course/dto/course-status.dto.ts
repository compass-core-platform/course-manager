import { ApiProperty } from "@nestjs/swagger";
import { CourseStatus } from "@prisma/client";
import { IsString, IsOptional, IsNotEmpty, IsEnum } from "class-validator";


export class CourseStatusDto {

    // course status (archived/unarchived)
    @ApiProperty()
    @IsEnum(CourseStatus)
    @IsNotEmpty()
    status: CourseStatus;
}