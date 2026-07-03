import bcrypt from "bcrypt";
import createHttpError, { HttpError } from "http-errors";
import { DeepPartial, Repository } from "typeorm";
import { User } from "../entities/user";
import { UserRole } from "../enums";
import { RegisterUserData } from "../types";

import { Tenant } from "../entities/tenant";
import { isUniqueConstraintError } from "../utils/index";

type CreateUserInput = RegisterUserData & {
  role?: User["role"];
  tenantId?: string;
};

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private tenantRepository: Repository<Tenant>
  ) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role = UserRole.CUSTOMER,
    tenantId
  }: CreateUserInput) {
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
      const userData: DeepPartial<User> = {
        firstName,
        lastName,
        email,
        password: hashPassword,
        role
      };

      if (tenantId) {
        // check if tenant exists
        const tenant = await this.tenantRepository.findOne({
          where: { id: tenantId }
        });
        if (!tenant) {
          throw createHttpError(404, "Tenant not found");
        }

        userData.tenant = tenant;
      }
      const user = await this.userRepository.save(userData);

      delete (user as Partial<User>).password;
      return user;
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

  async getUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id: id }
    });
  }
}
