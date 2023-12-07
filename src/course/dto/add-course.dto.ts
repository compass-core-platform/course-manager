import { ApiProperty } from "@nestjs/swagger";
import { CourseStatus } from "@prisma/client";
import { ArrayNotEmpty, IsArray, IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class AddCourseDto {

    // course title
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    // description
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    // link for the course content
    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    courseLink: string;


    // number of credits required to purchase course
    @ApiProperty()
    @IsNotEmpty()
    @Min(0)
    @IsInt()
    credits: number;

    // language
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    language: string[];

    // competency
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    competency: string;

    // author
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    author: string;

    // course status (archived/unarchived)
    @ApiProperty()
    @IsOptional()
    @IsEnum(CourseStatus)
    status?: CourseStatus;

    // course start date
    @ApiProperty()
    @IsDate()
    @IsOptional()
    startDate?: Date;

    // course end date
    @ApiProperty()
    @IsDate()
    @IsOptional()
    endDate?: Date;
}
