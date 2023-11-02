import { PartialType } from "@nestjs/swagger";
import { ProviderProfileResponse } from "./provider-profile-response.dto";

export class EditProvider extends PartialType(ProviderProfileResponse){
}