import { JsonValue } from "@prisma/client/runtime/library";

export class SearchResponseDTO {
    readonly id: string;
    readonly title: string;
    readonly long_desc: string;
    readonly provider_name: string;
    readonly provider_id: string;
    readonly price: string;
    readonly languages: string[];
    readonly competency: JsonValue;
    readonly imgUrl: string;
    readonly rating: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly noOfPurchases: number;
}