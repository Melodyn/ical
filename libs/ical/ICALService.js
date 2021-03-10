import icalProcessor from './common/icalProcessor.js';
import linkBuilder from './common/linkBuilder.js';
import rangeDates from './common/rangeDates.js';
import loader from './loader/index.js';
import * as parser from './common/parser.js';

export default class ICALService {
  constructor(params) {
    this.loader = loader(params.NODE_ENV);
    this.parser = parser;
    this.linkBuilder = linkBuilder;
    this.icalProcessor = icalProcessor;
    this.utils = {
      rangeDates,
    };
  }

  load(calendarId) {
    return this.loader(calendarId);
  }

  get parse() {
    return this.parser;
  }

  buildLinks(calendarId, timezone = '') {
    return this.linkBuilder(calendarId, timezone);
  }

  toEvents(icalEvents, params = { uniq: true, nextDays: 0, fromDate: Date.now() }) {
    return this.icalProcessor(icalEvents, params);
  }

  rangeDates(count, from = Date.now()) {
    return this.utils.rangeDates(count, from);
  }
}
