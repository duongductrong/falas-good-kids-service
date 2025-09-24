import { MigrationInterface, QueryRunner } from "typeorm"

export class CreatePersonVoteTables1758723590966 implements MigrationInterface {
  name = "CreatePersonVoteTables1758723590966"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "persons" (
                "id" SERIAL NOT NULL,
                "real_name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "avatar" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "votes" (
                "id" SERIAL NOT NULL,
                "voted_date" date NOT NULL,
                "slack_channel_id" character varying,
                "slack_channel_name" character varying,
                "slack_client_message_id" character varying,
                "slack_team_id" character varying,
                "metadata" json NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "voted_to_id" integer,
                "voted_by_id" integer,
                CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_d26356667b00a4382855804f08e" FOREIGN KEY ("voted_to_id") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_3c93ada36c9e9f0b3d163c4948a" FOREIGN KEY ("voted_by_id") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_3c93ada36c9e9f0b3d163c4948a"
        `)
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_d26356667b00a4382855804f08e"
        `)
    await queryRunner.query(`
            DROP TABLE "votes"
        `)
    await queryRunner.query(`
            DROP TABLE "persons"
        `)
  }
}
