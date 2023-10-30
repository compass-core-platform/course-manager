import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class FeedbackDto {

    //  Feedback Text
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    feedback: string;

    //  Integer rating of the course
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    rating: number;
}
