import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FeedbackDto {

    //  Feedback Text
    @ApiProperty()
    @IsOptional()
    @IsString()
    feedback?: string;

    //  Integer rating of the course
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    rating: number;
}
