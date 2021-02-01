import luxon from 'luxon';
import typeorm from 'typeorm';
import _ from 'lodash';
import { prepareEvents } from '../utils.js';

const { DateTime } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

const syncWidget = async ({
  period,
  widgetService,
  reporter,
}) => {
  const calendarRepo = getConnection().getRepository('Calendar');
  const updateDate = DateTime.local().minus(period).toSQL();

  const calendarsForWidget = await calendarRepo.find({
    where: {
      widgetToken: Not(IsNull()),
      widgetSyncedAt: LessThan(updateDate),
    },
    order: {
      widgetSyncedAt: 'DESC',
    },
  });

  const plainActualCalendars = calendarsForWidget
    .map(({
      id,
      widgetToken,
      clubId,
      timezone,
      extra: { ical },
    }) => {
      const events = ical
        .filter(({ type }) => (type === 'VEVENT'))
        .map((event) => prepareEvents(event, reporter))
        .filter(({ isFinished }) => !isFinished);

      return {
        id,
        widgetToken,
        clubId,
        timezone,
        events: _.sortBy(events, 'startMS'),
      };
    });

  const calendarsWithWidget = plainActualCalendars.map(widgetService.create);

  const requests = calendarsWithWidget
    .map((calendar) => widgetService
      .send(calendar)
      .then((result) => (!result.error
        ? result
        : calendarRepo.update(calendar.id, {
          widgetToken: null,
          widgetSyncedAt: null,
          extra: {
            ...calendar.extra,
            widgetError: result.error,
          },
        }))));

  return Promise.all(requests);
};

export default syncWidget;
