import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantTable1782984986534 implements MigrationInterface {
  name = "CreateTenantTable1782984986534";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(50) NOT NULL, "address" character varying(100) NOT NULL, CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "tenantId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
