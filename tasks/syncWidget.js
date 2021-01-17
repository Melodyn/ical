import luxon from 'luxon';
import typeorm from 'typeorm';
import axios from 'axios';
import _ from 'lodash';

const { DateTime, Duration } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

const toMS = (date) => (new Date(date)).getTime();
const getDateNowMS = () => Date.now();

const getDateFormat = (datetype) => {
  const createFormat = (start, end = '') => ({ start, end });

  return (datetype === 'date')
    ? createFormat("'с' dd.MM", "'до' dd.MM")
    : createFormat("'с' HH:mm dd.MM", "'до' HH:mm dd.MM");
};

const prepareEvents = (event) => {
  const type = _.has(event, 'rrule') ? 'periodic' : 'once';
  const startMS = toMS(event.start);
  const endMS = toMS(event.end);

  const firstStartDT = DateTime.fromMillis(startMS);
  const firstEndDT = DateTime.fromMillis(endMS);
  const durationMS = firstEndDT.diff(firstStartDT).milliseconds;

  const intervalMS = (type === 'periodic')
    ? Duration.fromObject({ days: event.interval }).as('milliseconds')
    : 0;

  return {
    type,
    startMS,
    endMS,
    durationMS,
    intervalMS,
    summary: event.summary,
    datetype: event.datetype,
  };
};

const createWidget = (calendar) => {
  const { clubId, timezone, events } = calendar;

  const rows = _.take(events, 6)
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
        title: _.truncate(summary, { length: 100 }),
        descr: _.truncate(description, { length: 100 }),
        time: `${eventStartDate} ${eventEndDate}`.trim(),
      };
    });
  const currentDateTime = DateTime.local().setZone(timezone).toFormat("dd.MM 'в' HH:mm");
  const title = `обновлено ${currentDateTime}`;
  const more = 'Перейти в календарь';
  const more_url = `//vk.com/app7703913_-${clubId}`;

  const widget = {
    title,
    rows,
    more,
    more_url,
  };

  return {
    ...calendar,
    widget,
  };
};

const sendWidget = ({ widgetToken, widget }) => axios.get(
  'https://api.vk.com/method/appWidgets.update',
  {
    params: {
      type: 'list',
      code: `return ${JSON.stringify(widget)};`,
      v: 5.126,
      access_token: widgetToken,
    },
  },
);

const syncWidget = async (period) => {
  const calendarRepo = getConnection().getRepository('Calendar');
  const updateDate = DateTime.local().minus(period).toSQL();

  const calendarsForWidget = await calendarRepo.find({
    widgetToken: Not(IsNull()),
    widgetSyncedAt: LessThan(updateDate),
  });

  const nowMS = getDateNowMS();
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
        .map(prepareEvents)
        .filter(({ type, startMS }) => ((type === 'once') && startMS >= nowMS));

      return {
        id,
        widgetToken,
        clubId,
        timezone,
        events,
      };
    });

  const calendarsWithWidget = plainActualCalendars.map(createWidget);

  const requests = calendarsWithWidget.map(sendWidget);

  return Promise.all(requests);
};

export default syncWidget;

// const handleEvents = (event) => {
//   console.log(event);
//   if (!event.rrule) {
//     return { event };
//   }
//
//   const {
//     start: firstStart, end: firstEnd,
//     summary, datetype,
//     rrule: {
//       options: {
//         until,
//         dtstart,
//         interval,
//       },
//     },
//   } = event;
//
//   const nowDT = DateTime.local().setZone(timezone);
//   const startMS = toMS(dtstart);
//   const firstStartDT = DateTime.fromMillis(toMS(firstStart)).setZone(timezone);
//   const firstEndDT = DateTime.fromMillis(toMS(firstEnd)).setZone(timezone);
//   const duration = firstEndDT.diff(firstStartDT).milliseconds;
//
//   if (startMS >= dateNowMS) {
//     return {
//       event: JSON.stringify(event),
//       summary,
//       datetype,
//       duration,
//       interval,
//       startMS: firstStartDT.toISO,
//       endMS: firstEndDT.toISO,
//       type: 'startMS >= dateNowMS',
//     };
//   }
//
//   const msLeftFromStart = nowDT.diff(firstStartDT).milliseconds;
//   const intervalMS = Duration.fromObject({ days: interval }).as('milliseconds');
//   const msOffsetForStart = msLeftFromStart % intervalMS;
//   const startDT = nowDT.minus({ milliseconds: msOffsetForStart });
//   const endDT = startDT.plus({ milliseconds: duration });
//   const isDaily = interval < 2;
//
//   if (isDaily) {
//     return {
//       event: JSON.stringify(event),
//       summary,
//       datetype,
//       duration,
//       msLeftFromStart,
//       msOffsetForStart,
//       interval,
//       intervalMS,
//       startMS: startDT.toISO(),
//       endMS: endDT.toISO(),
//       type: 'isDaily',
//     };
//   }
//
//   const nextStartDT = startDT.plus({ milliseconds: intervalMS });
//   const nextEndDT = endDT.plus({ milliseconds: intervalMS });
//
//   return [
//     {
//       event: JSON.stringify(event),
//       summary,
//       datetype,
//       duration,
//       msLeftFromStart,
//       msOffsetForStart,
//       interval,
//       intervalMS,
//       startMS: startDT.toISO(),
//       endMS: endDT.toISO(),
//       type: 'minStartDT',
//     },
//     {
//       event: JSON.stringify(event),
//       summary,
//       datetype,
//       duration,
//       msLeftFromStart,
//       msOffsetForStart,
//       interval,
//       intervalMS,
//       startMS: nextStartDT.toISO(),
//       endMS: nextEndDT.toISO(),
//       type: 'nextStartDT',
//     },
//   ];
// });
