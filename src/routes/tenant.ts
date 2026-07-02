import express from "express";
import { AppDataSource } from "../config/dataSource";
import logger from "../config/logger";
import { TenantController } from "../controllers/tenantController";
import { Tenant } from "../entities/tenant";
import { UserRole } from "../enums";
import { authenticate } from "../middlewares/authenticate";
import authorized from "../middlewares/authorized";
import { valdiate } from "../middlewares/validate";
import { tenantSchema } from "../schemas/tenantSchema";
import { TenantService } from "../services/tenantService";

const tenantRouter = express.Router();

// dependencies
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

// routes for tenants

tenantRouter.post(
  "/",
  authenticate,
  authorized([UserRole.ADMIN]), // aurthorized only for admin
  valdiate(tenantSchema),
  (req, res) => tenantController.create(req, res)
);

export default tenantRouter;
