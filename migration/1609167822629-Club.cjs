class Club1609167822629 {
  constructor() {
    this.name = 'Club1609167822629';
  }

  async up(queryRunner) {
    await queryRunner.query('CREATE TABLE "club" ("id" SERIAL NOT NULL, "vkGroupId" integer NOT NULL, "calendarId" character varying NOT NULL, "extra" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_79282481e036a6e0b180afa38aa" PRIMARY KEY ("id"))');
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE "club"');
  }
}

module.exports = Club1609167822629;
