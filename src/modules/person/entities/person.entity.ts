import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { VoteEntity } from "../../vote/entities/vote.entity"

@Entity({
  name: "persons",
})
export class PersonEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  realName: string

  @Column()
  email: string

  @OneToMany(() => VoteEntity, (vote) => vote.votedBy)
  votes: VoteEntity[]

  @Column({ nullable: true })
  avatar?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt?: Date
}
