import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { PersonEntity } from "../../person/entities/person.entity"
import { VoteTopicEntity } from "./vote-topic.entity"

@Entity({
  name: "votes",
})
export class VoteEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "date" })
  votedDate: Date

  @ManyToOne(() => PersonEntity)
  votedTo: PersonEntity

  @ManyToOne(() => PersonEntity, (person) => person.votes)
  votedBy: PersonEntity

  @Column({
    nullable: true,
  })
  slackChannelId?: string

  @Column({
    nullable: true,
  })
  slackChannelName?: string

  @Column({
    nullable: true,
  })
  slackClientMessageId?: string

  @ManyToOne(() => VoteTopicEntity, (topic) => topic.votes)
  topic: VoteTopicEntity

  @Column({
    nullable: true,
  })
  slackTeamId?: string

  @Column({ type: "json" })
  metadata?: Record<string, any>

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt?: Date
}
