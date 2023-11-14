import { ApiProperty, PartialType } from "@nestjs/swagger";
import { AddCourseDto } from "./add-course.dto";
import { IsArray, IsDate, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { CourseStatus } from "@prisma/client";

export class EditCourseDto {

    // course title
    @ApiProperty()
    @IsString()
    @IsOptional()
    title?: string;

    // description
    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    // link for the course content
    @ApiProperty()
    @IsString()
    @IsOptional()
    courseLink?: string;

    // course image
    @ApiProperty()
    @IsString()
    @IsOptional()
    imgLink?: string;

    // number of credits required to purchase course
    @ApiProperty()
    @Min(0)
    @IsInt()
    @IsOptional()
    credits?: number;

    // Number of lessons
    @ApiProperty()
    @IsInt()
    @IsOptional()
    noOfLessons?: number;

    // language
    @ApiProperty()
    @IsArray()
    @IsOptional()
    language?: string[];

    // course duration
    @ApiProperty()
    @Min(0)
    @IsInt()
    @IsOptional()
    duration?: number;

    // competency
    @ApiProperty()
    @IsOptional()
    competency?: any;

    // author
    @ApiProperty()
    @IsString()
    @IsOptional()
    author?: string;

    // course status (active/inactive/archived)
    // @ApiProperty()
    // @IsString()
    // @IsOptional()
    // status: CourseStatus;

    // course availability time
    @ApiProperty()
    @IsDate()
    @IsOptional()
    availabilityTime?: Date;
}