import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { UserRole } from "../enums";
import { BaseEntity } from "./baseEnitity";
import { RefreshToken } from "./refreshToken";
import { Tenant } from "./tenant";

@Entity({
  name: "users"
})
export class User extends BaseEntity {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    unique: true
  })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role!: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    onDelete: "CASCADE" // meaning if user is deleted , then delete all the refresh tokens related to this user as well
  })
  refreshTokens!: RefreshToken[];

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: "tenantId" }) // this name will be shown in the database column name as foreign key
  tenant!: Tenant;
}
