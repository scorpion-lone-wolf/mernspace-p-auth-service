import { Repository } from "typeorm";
import { Tenant } from "../entities/tenant";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: Tenant): Promise<Tenant> {
    const tenant = this.tenantRepository.create({ name, address });
    return await this.tenantRepository.save(tenant);
  }
}
