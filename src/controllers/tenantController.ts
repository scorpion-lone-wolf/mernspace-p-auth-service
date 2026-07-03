import { Request, Response } from "express";
import createHttpError from "http-errors";
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

  async getAll(req: Request, res: Response) {
    try {
      const tenants = await this.tenantService.fetchAll();
      return res.json({
        data: tenants
      });
    } catch (error) {
      throw error;
    }
  }
  async get(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!id) {
        throw createHttpError(400, "Tenant id is required");
      }
      const tenant = await this.tenantService.fetch(id);
      return res.json({
        data: tenant
      });
    } catch (error) {
      throw error;
    }
  }
}
