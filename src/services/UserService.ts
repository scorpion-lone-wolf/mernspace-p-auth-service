import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entities/User";
import { UserData } from "../types";
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password
      });
    } catch (error) {
      throw createHttpError(500, "Failed to store the data in the database");
    }
  }
}
