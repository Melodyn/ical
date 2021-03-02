import linkBuilder from '../common/linkBuilder.js';
import { fromURL } from '../common/parser.js';
import configValidator from '../../../utils/configValidator.cjs';
import calendarFixture from '../../../__fixtures__/calendar.js';

const { envsMap } = configValidator;

const prodService = (calendarId) => {
  const { ical } = linkBuilder(calendarId);
  return fromURL(ical);
};
const devService = () => calendarFixture;
const testService = () => calendarFixture;

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
