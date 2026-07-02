import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./baseEnitity";
import { User } from "./user";

@Entity({ name: "tenants" })
export class Tenant extends BaseEntity {
  @Column("varchar", { length: 50 })
  name!: string;

  @Column("varchar", { length: 100 })
  address!: string;

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];
}
