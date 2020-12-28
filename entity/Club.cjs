const { EntitySchema } = require('typeorm');
const Club = require('../model/Club.cjs');

module.exports = new EntitySchema({
  name: 'Club',
  target: Club,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    vkGroupId: {
      type: 'int',
      nullable: false,
    },
    calendarId: {
      type: 'varchar',
    },
    extra: {
      type: 'jsonb',
    },
    createdAt: {
      type: 'timestamp',
    },
    updatedAt: {
      type: 'timestamp',
    },
  },
});
