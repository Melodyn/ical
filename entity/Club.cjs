const { EntitySchema } = require('typeorm');
const Club = require('../model/Club.cjs');

module.exports = new EntitySchema({
  name: 'Club',
  target: Club,
  tableName: 'clubs',
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
