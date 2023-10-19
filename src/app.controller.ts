import { Controller, Get, HttpStatus } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags("default")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "default route for service health check" }) // Describes the operation for Swagger.
  @ApiResponse({ status: HttpStatus.OK, type: String }) // Describes the response for Swagger.
  getHealth(): string {
    return this.appService.getHealth();
  }
}
