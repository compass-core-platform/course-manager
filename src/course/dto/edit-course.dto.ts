import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

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
    @IsUrl()
    @IsOptional()
    courseLink?: string;

    // course image
    @ApiProperty()
    @IsUrl()
    @IsOptional()
    imageLink?: string;

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

    // competency
    @ApiProperty()
    @IsOptional()
    @IsString()
    competency?: string;

    // author
    @ApiProperty()
    @IsString()
    @IsOptional()
    author?: string;

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