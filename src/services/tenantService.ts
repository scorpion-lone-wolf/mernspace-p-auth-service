import createHttpError from "http-errors";
import { Brackets, QueryFailedError, Repository } from "typeorm";
import { Tenant } from "../entities/tenant";

export class TenantService {
  constructor(private readonly tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: Tenant): Promise<Tenant> {
    const tenant = this.tenantRepository.create({ name, address });
    return await this.tenantRepository.save(tenant);
  }

  async fetchAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<[Tenant[], number]> {
    const tenantQueryBuilder = this.tenantRepository
      .createQueryBuilder("tenant")
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      tenantQueryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("tenant.name ILIKE :query", {
            query: `%${search}%`
          }).orWhere("tenant.address ILIKE :query", {
            query: `%${search}%`
          });
        })
      );
    }

    const [tenants, count] = await tenantQueryBuilder.getManyAndCount();
    return [tenants, count];
  }
  async fetch(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw createHttpError(404, "Tenant not found");
    }
    return tenant;
  }

  async update(id: string, { name, address }: Tenant): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw createHttpError(404, "Tenant not found");
    }
    // logic to only update fields that has been send by the user to update
    tenant.name = name ?? tenant.name;
    tenant.address = address ?? tenant.address;
    return await this.tenantRepository.save(tenant);
  }

  async delete(id: string) {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id } });
      if (!tenant) {
        throw createHttpError(404, "Tenant not found");
      }
      return await this.tenantRepository.remove(tenant);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.code === "23503") {
          throw createHttpError(
            409,
            "Cannot delete tenant because it has users"
          );
        }
      }
      throw error;
    }
  }
}
