import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./baseEnitity";
import { User } from "./user";

@Entity({ name: "refreshTokens" })
export class RefreshToken extends BaseEntity {
  //   multiple tokens belongs to one user
  @ManyToOne(() => User, (user) => user.refreshTokens)
  user!: User;

  @Column({
    type: "timestamp"
  })
  expiresAt!: Date;
}
