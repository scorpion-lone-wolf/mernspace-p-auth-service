import bcrypt from "bcrypt";
import createHttpError, { HttpError } from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entities/User";
import { UserData } from "../types";
import { isUniqueConstraintError } from "../utils/index";
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    try {
      // check if email already exist or not
      const userCount = await this.userRepository.count({
        where: { email }
      });
      if (userCount > 0) {
        throw createHttpError(409, "Email already exists");
      }
      // create a hash password for the user
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds);
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashPassword
      });
    } catch (err: unknown) {
      if (
        isUniqueConstraintError(err) ||
        (err instanceof HttpError && err.status === 409)
      ) {
        // duplicate email
        throw createHttpError(409, "Email already exists");
      }
      throw createHttpError(500, "Failed to store the data in the database");
    }
  }
}
