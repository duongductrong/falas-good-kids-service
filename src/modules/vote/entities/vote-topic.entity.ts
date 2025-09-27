import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { VoteEntity } from "./vote.entity"

@Entity({
  name: "vote_topics",
})
export class VoteTopicEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  text: string

  @Column({
    unique: true,
  })
  value: string

  @OneToMany(() => VoteEntity, (vote) => vote.topic)
  votes: VoteEntity[]

  @Column({ default: true })
  active: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt?: Date
}
