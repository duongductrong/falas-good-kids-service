import { MigrationInterface, QueryRunner } from "typeorm"

export class AlterMessageToVote1759656052025 implements MigrationInterface {
  name = "AlterMessageToVote1759656052025"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_d26356667b00a4382855804f08e"
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD "message" character varying
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_e3ea08a8c2857d9c67e38fbe354" FOREIGN KEY ("voted_for_id") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_e3ea08a8c2857d9c67e38fbe354"
        `)
    await queryRunner.query(`
            ALTER TABLE "votes" DROP COLUMN "message"
        `)
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_d26356667b00a4382855804f08e" FOREIGN KEY ("voted_for_id") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }
}
