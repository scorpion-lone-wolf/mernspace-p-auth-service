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
import updateTenantSchema from "../schemas/updateTenantSchema";
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

tenantRouter.get(
  "/",
  authenticate,
  authorized([UserRole.ADMIN]), // aurthorized only for admin
  (req, res) => tenantController.getAll(req, res)
);
tenantRouter.get(
  "/:id",
  authenticate,
  authorized([UserRole.ADMIN]), // aurthorized only for admin
  (req, res) => tenantController.get(req, res)
);

tenantRouter.patch(
  "/:id",
  valdiate(updateTenantSchema),
  authenticate,
  authorized([UserRole.ADMIN]), // aurthorized only for admin
  (req, res) => tenantController.update(req, res)
);

export default tenantRouter;
