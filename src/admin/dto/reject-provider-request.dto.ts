import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class RejectProviderRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    rejectionReason: string
}