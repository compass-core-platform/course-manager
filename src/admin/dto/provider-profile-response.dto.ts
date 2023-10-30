import { ApiProperty } from "@nestjs/swagger";
import { ProviderStatus } from "@prisma/client";

export class ProviderProfileResponse {
    @ApiProperty({required: false})
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({format: 'email'})
    email: string;
    
    @ApiProperty()
    password: string;

    @ApiProperty()
    walletId: number;

    @ApiProperty()
    paymentInfo: any;

    @ApiProperty()
    status: ProviderStatus;
    // readonly courses: Course[];
}