import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTopicTable1758973991994 implements MigrationInterface {
  name = "CreateTopicTable1758973991994"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "vote_topics" (
                "id" SERIAL NOT NULL,
                "text" character varying NOT NULL,
                "value" character varying NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_3b829494e50391550562af0fca3" UNIQUE ("value"),
                CONSTRAINT "PK_462eebe9f0585a9356ceaa3e81f" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD "topic_id" integer
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_ec6bc56adab31a21334d07cc117" FOREIGN KEY ("topic_id") REFERENCES "vote_topics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_ec6bc56adab31a21334d07cc117"
        `)
    await queryRunner.query(`
            ALTER TABLE "votes" DROP COLUMN "topic_id"
        `)
    await queryRunner.query(`
            DROP TABLE "vote_topics"
        `)
  }
}
