class Calendar1609182264932 {
  constructor() {
    this.name = 'Calendar1609182264932';
  }

  async up(queryRunner) {
    await queryRunner.query('CREATE TABLE "calendars" ("id" SERIAL NOT NULL, "clubId" integer NOT NULL, "calendarId" character varying NOT NULL, "extra" jsonb NOT NULL DEFAULT \'{}\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "club_calendar" UNIQUE ("clubId", "calendarId"), CONSTRAINT "PK_79282481e036a6e0b180afa38aa" PRIMARY KEY ("id"))');
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE "calendars"');
  }
}

module.exports = Calendar1609182264932;