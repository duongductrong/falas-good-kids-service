import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserTable1753555058551 implements MigrationInterface {
  name = "CreateUserTable1753555058551"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM(
                'super_admin',
                'admin',
                'staff',
                'customer',
                'other'
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "first_name" character varying(255),
                "last_name" character varying(255),
                "email" character varying NOT NULL,
                "refresh_token" character varying,
                "password" character varying,
                "role" "public"."users_role_enum" NOT NULL,
                "picture" character varying,
                "metadata" jsonb,
                "provider" character varying(255),
                "provider_id" character varying(255),
                "email_verified" boolean,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "is_active" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "users"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `)
  }
}
