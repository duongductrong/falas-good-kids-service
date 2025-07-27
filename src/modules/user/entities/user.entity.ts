import { Exclude } from "class-transformer"
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { UserRole } from "../user.constant"

@Entity({
  name: "users",
})
export class UserEntity {
  @PrimaryGeneratedColumn({
    type: "integer",
  })
  id: number

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  firstName?: string

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  lastName?: string

  @Column({
    type: "varchar",
    unique: true,
  })
  email: string

  @Column({
    type: "varchar",
    nullable: true,
  })
  refreshToken?: string

  @Column({
    type: "varchar",
    select: false,
    nullable: true,
  })
  @Exclude()
  password?: string

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole

  @Column({
    type: "varchar",
    nullable: true,
  })
  picture?: string

  @Column({
    type: "jsonb",
    nullable: true,
  })
  metadata?: object

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  provider?: string

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  providerId?: string

  @Column({
    type: "boolean",
    nullable: true,
  })
  emailVerified?: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  @Column({
    type: "boolean",
    default: false,
  })
  isActive?: boolean
}
