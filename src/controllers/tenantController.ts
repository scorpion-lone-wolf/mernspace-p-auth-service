import { Request, Response } from "express";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { TenantService } from "../services/tenantService";
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly logger: Logger
  ) {}

  async create(req: Request, res: Response) {
    this.logger.debug("New Request to create tenant", req.body);
    const tenantData = await this.tenantService.create(req.body);
    this.logger.info("New tenant created", tenantData);
    return res
      .status(201)
      .json({ message: "Tenant created successfully", data: tenantData });
  }

  async getAll(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const [tenants, count] = await this.tenantService.fetchAll(
      +pageNumber,
      +limitNumber
    );

    return res.json({
      message: "Tenant fetched successfully",
      data: tenants,
      page: pageNumber,
      limit: limitNumber,
      total: count
    });
  }
  async get(req: Request, res: Response) {
    const id = String(req.params.id);
    if (!id) {
      throw createHttpError(400, "Tenant id is required");
    }
    const tenant = await this.tenantService.fetch(id);
    return res.json({
      message: "Tenant fetched successfully",
      data: tenant
    });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);
    if (!id) {
      throw createHttpError(400, "Tenant id is required");
    }
    // check at least one field is ask to be updated
    if (Object.keys(req.body).length === 0) {
      throw createHttpError(400, "At least one field is required to update");
    }
    const tenant = await this.tenantService.update(id, req.body);
    return res.json({
      message: "Tenant updated",
      data: tenant
    });
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);
    if (!id) {
      throw createHttpError(400, "Tenant id is required");
    }
    const tenant = await this.tenantService.delete(id);
    return res.json({
      message: "Tenant deleted",
      data: tenant
    });
  }
}
