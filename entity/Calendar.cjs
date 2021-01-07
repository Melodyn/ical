const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Calendar',
  tableName: 'calendars',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    clubId: {
      type: 'int',
      nullable: false,
    },
    calendarId: {
      type: 'varchar',
      nullable: false,
    },
    timezone: {
      type: 'varchar',
      nullable: false,
    },
    widgetToken: {
      type: 'varchar',
      nullable: true,
      default: null,
    },
    widgetSyncedAt: {
      type: 'timestamp without time zone',
      nullable: true,
      default: null,
    },
    extra: {
      type: 'jsonb',
      default: '{}',
    },
    createdAt: {
      type: 'timestamp without time zone',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp without time zone',
      updateDate: true,
    },
  },
  uniques: [
    {
      name: 'club_calendar',
      columns: ['clubId', 'calendarId'],
    },
  ],
});
