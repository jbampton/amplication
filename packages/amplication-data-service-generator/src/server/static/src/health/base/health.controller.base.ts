import { Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";
import { HealthService } from "../health.service";

export class HealthControllerBase {
  constructor(protected readonly healthService: HealthService) {}
  @Get("live")
  healthLive(@Res() response: Response): Response<void> {
    return response.status(HttpStatus.OK).send();
  }
  @Get("ready")
  async healthReady(@Res() response: Response): Promise<Response<void>> {
    const dbConnection = await this.healthService.isDbReady();
    if (!dbConnection) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "SERVICE UNAVAILABLE",
        message: "No connection to db",
      });
    }
    return response.status(HttpStatus.OK).send();
  }
}
