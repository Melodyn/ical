const { EntitySchema } = require('typeorm');
const Calendar = require('../model/Calendar.cjs');

module.exports = new EntitySchema({
  name: 'Calendar',
  target: Calendar,
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
    extra: {
      type: 'jsonb',
      default: '{}',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
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