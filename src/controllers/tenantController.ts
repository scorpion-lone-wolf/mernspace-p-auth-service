import { Request, Response } from "express";
import { Logger } from "winston";
import { TenantService } from "../services/tenantService";
export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {}

  async create(req: Request, res: Response) {
    try {
      this.logger.debug("New Request to create tenant", req.body);
      const tenantData = await this.tenantService.create(req.body);
      this.logger.info("New tenant created", tenantData);
      return res
        .status(201)
        .json({ message: "Tenant created", data: tenantData });
    } catch (error) {
      this.logger.error("Error creating tenant", error);
      throw error;
    }
  }
}
