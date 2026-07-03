import express from "express";
import { AppDataSource } from "../config/dataSource";
import logger from "../config/logger";
import { TenantController } from "../controllers/tenantController";
import { Tenant } from "../entities/tenant";
import { TenantService } from "../services/tenantService";

const publicTenantRouter = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

publicTenantRouter.get("/", (req, res) => tenantController.getAll(req, res));

export default publicTenantRouter;
