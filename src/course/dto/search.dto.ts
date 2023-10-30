import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SearchDto {

    // Search string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    searchInput: string;

    // competency filters
    @ApiProperty()
    competencies: Record<string, string[]>;
}
