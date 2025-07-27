import { BadRequestException, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcryptjs"
import { FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm"
import { UserEntity } from "./entities/user.entity"
import { UserRole } from "./user.constant"

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepo: Repository<UserEntity>

  findUserByEmail(
    email: string,
    options?: {
      select?: FindOptionsSelect<UserEntity>
      where?: FindOptionsWhere<UserEntity>
    },
  ): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: {
        email,
        deletedAt: null,
        ...options?.where,
      },
      select: {
        password: true,
        createdAt: true,
        deletedAt: true,
        email: true,
        firstName: true,
        refreshToken: true,
        id: true,
        isActive: true,
        lastName: true,
        role: true,
        updatedAt: true,
        ...options?.select,
      },
    })
  }

  findUserByProvider(
    payload?: { providerId: string; provider: string },
    options?: {
      where?: FindOptionsWhere<UserEntity>
      select?: FindOptionsSelect<UserEntity>
    },
  ) {
    return this.userRepo.findOne({
      ...options,
      where: {
        provider: payload.provider,
        providerId: payload.providerId,
        ...options?.where,
      },
      select: {
        ...options?.select,
      },
    })
  }

  findUserById(
    id: number,
    options?: {
      select?: FindOptionsSelect<UserEntity>
      where?: FindOptionsWhere<UserEntity>
    },
  ): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: {
        id,
        deletedAt: null,
        ...options?.where,
      },
      select: {
        password: true,
        createdAt: true,
        deletedAt: true,
        email: true,
        firstName: true,
        id: true,
        isActive: true,
        refreshToken: true,
        lastName: true,
        role: true,
        updatedAt: true,
        ...options?.select,
      },
    })
  }

  createSuperAdmin(user: Omit<UserEntity, "role">): Promise<UserEntity | null> {
    const userCreated = this.userRepo.create({
      ...user,
      role: UserRole.SuperAdmin,
    })

    return this.userRepo.save(userCreated)
  }

  async createUser(
    payload: Omit<UserEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<UserEntity | null> {
    const user = await this.userRepo.findOne({
      where: {
        email: payload.email,
      },
    })

    if (user) {
      throw new BadRequestException("User already exists")
    }

    const hashedPassword = !payload.password
      ? null
      : await bcrypt.hash(payload.password, 10)

    const userCreated = this.userRepo.create({
      role: UserRole.Customer,
      ...payload,
      password: hashedPassword,
    })

    return this.userRepo.save(userCreated)
  }

  updateUser(id: number, payload: Partial<UserEntity>) {
    return this.userRepo.update(id, payload)
  }

  softDelete(id: number) {
    return this.userRepo.softDelete(id)
  }

  permanentDelete(id: number) {
    return this.userRepo.delete(id)
  }
}
