import icalProcessor from './common/icalProcessor.js';
import linkBuilder from './common/linkBuilder.js';
import loader from './loader/index.js';
import * as parser from './common/parser.js';

export default class ICALService {
  constructor(params) {
    this.loader = loader(params.NODE_ENV);
    this.parser = parser;
    this.linkBuilder = linkBuilder;
    this.icalProcessor = icalProcessor;
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
}
