import linkBuilder from '../common/linkBuilder.js';
import { fromURL } from '../common/parser.js';
import configValidator from '../../../utils/configValidator.cjs';
import calendarFixture from '../../../__fixtures__/calendar.js';
// import newFixture from '../10.03.2021.ics.js';
// import newFixture2 from '../10.03.2021_2.ics.js';

const { envsMap } = configValidator;

const prodService = (calendarId) => {
  const { ical } = linkBuilder(calendarId);
  return fromURL(ical);
};
const devService = async () => calendarFixture;
const testService = async () => calendarFixture;

export default (env) => {
  switch (env) {
    case envsMap.prod:
    case envsMap.stage:
      return prodService;
    case envsMap.dev:
      return devService;
    default:
      return testService;
  }
};
