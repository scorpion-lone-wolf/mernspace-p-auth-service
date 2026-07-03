import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./baseEnitity";
import { User } from "./user";

@Entity({ name: "refreshTokens" })
export class RefreshToken extends BaseEntity {
  //   multiple tokens belongs to one user
  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: "CASCADE" // meaning if user is deleted , then delete all the refresh tokens related to this user as well
  })
  user!: User;

  @Column({
    type: "timestamp"
  })
  expiresAt!: Date;
}
