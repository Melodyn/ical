class Calendar1609182264932 {
  constructor() {
    this.name = 'Calendar1609182264932';
  }

  async up(queryRunner) {
    await queryRunner.query('CREATE TABLE "calendars" ("id" SERIAL NOT NULL, "clubId" integer NOT NULL, "calendarId" character varying NOT NULL, "timezone" character varying NOT NULL, "widgetToken" character varying DEFAULT null, "widgetSyncedAt" TIMESTAMP DEFAULT null, "extra" jsonb NOT NULL DEFAULT \'{}\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "club_calendar" UNIQUE ("clubId", "calendarId"), CONSTRAINT "PK_90dc0330e8ec9028e23c290dee8" PRIMARY KEY ("id"))');
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE "calendars"');
  }
}

module.exports = Calendar1609182264932;
