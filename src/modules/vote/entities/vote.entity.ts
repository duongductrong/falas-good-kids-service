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

  @Column({ nullable: true })
  message?: string

  @Column({ type: "date" })
  votedDate: Date

  @ManyToOne(() => PersonEntity, (person) => person.votesReceived)
  votedFor: PersonEntity

  @ManyToOne(() => PersonEntity, (person) => person.votesGiven, {
    nullable: true,
  })
  votedBy?: PersonEntity

  @Column({ nullable: true })
  votedByAnonymous: string

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
