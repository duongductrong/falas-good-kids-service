import { MigrationInterface, QueryRunner } from "typeorm"

export class AlterVoteEntityAnonymousColumn1759248703462
  implements MigrationInterface
{
  name = "AlterVoteEntityAnonymousColumn1759248703462"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD "voted_by_anonymous" character varying
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP COLUMN "voted_by_anonymous"
        `)
  }
}
