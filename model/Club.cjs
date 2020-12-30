class Club {
  constructor(id, clubId, calendarId, extra, createdAt, updatedAt) {
    this.id = id;
    this.clubId = clubId;
    this.calendarId = calendarId;
    this.extra = extra;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Club;
