import { PartialType } from "@nestjs/swagger";
import { ProviderProfileResponse } from "../../provider/dto/provider-profile-response.dto";

export class EditProvider extends PartialType(ProviderProfileResponse){
}