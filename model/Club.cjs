class Club {
  constructor(id, vkGroupId, calendarId, extra, createdAt, updatedAt) {
    this.id = id;
    this.vkGroupId = vkGroupId;
    this.calendarId = calendarId;
    this.extra = extra;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Club;
