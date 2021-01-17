import _ from 'lodash';
import luxon from 'luxon';
import { getDateFormat } from './utils.js';

const { DateTime } = luxon;

const list = (calendar) => {
  const { timezone, events } = calendar;

  const maxTitleLength = 100;
  const maxDescriptionLength = 100;
  const maxElementsCount = 6;

  const rows = _.take(events, maxElementsCount)
    .map(({
      summary,
      datetype,
      description,
      startMS,
      endMS,
    }) => {
      const { start: startFormat, end: endFormat } = getDateFormat(datetype);
      const eventStartDate = DateTime.fromMillis(startMS).setZone(timezone).toFormat(startFormat);
      const eventEndDate = DateTime.fromMillis(endMS).setZone(timezone).toFormat(endFormat);

      return {
        title: _.truncate(summary, { length: maxTitleLength }),
        descr: _.truncate(description, { length: maxDescriptionLength }),
        time: `${eventStartDate} ${eventEndDate}`.trim(),
      };
    });

  return { rows };
};

export default {
  list,
};
