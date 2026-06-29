import bcrypt from "bcrypt";
import createHttpError, { HttpError } from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entities/user";
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

  async login({ email, password }: { email: string; password: string }) {
    try {
      // Step 1:  Check if user exists or not
      const user = await this.userRepository.findOne({
        where: { email: email },
        select: { id: true, password: true, email: true, role: true } // select only id , email and password explicitly
      });
      if (!user) {
        throw createHttpError(404, "User not found");
      }
      // Step 2: If  user exist ? check if password is correct or not?
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        throw createHttpError(401, "Password is incorrect");
      }

      return { id: user.id, email: user.email, role: user.role } as User;
    } catch (err) {
      if (
        isUniqueConstraintError(err) ||
        (err instanceof HttpError && err.status === 409)
      ) {
        // duplicate email
        throw createHttpError(409, "Email already exists");
      }
      throw err;
    }
  }
}
