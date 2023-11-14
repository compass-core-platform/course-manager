import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CompetencyMap } from "src/utils/types";

export class SearchDto {

    // Search string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    searchInput: string;

    // competency filters
    @ApiProperty()
    competencies: CompetencyMap;
}