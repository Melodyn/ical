import _ from 'lodash';
import luxon from 'luxon';

const { DateTime, Duration } = luxon;

export const eventTypes = {
  periodic: 'periodic',
  once: 'once',
};
export const toMS = (date) => (new Date(date)).getTime();
export const getDateNowMS = () => Date.now();
export const createFormat = (start, end = '') => ({ start, end });
export const getDateFormat = (datetype) => ((datetype === 'date')
  ? createFormat("'с' dd.MM", "'до' dd.MM")
  : createFormat("'с' HH:mm dd.MM", "'до' HH:mm dd.MM"));

export const prepareEvents = (event) => {
  const type = _.has(event, 'rrule') ? eventTypes.periodic : eventTypes.once;
  const startMS = toMS(event.start);
  const endMS = toMS(event.end);

  const firstStartDT = DateTime.fromMillis(startMS);
  const firstEndDT = DateTime.fromMillis(endMS);
  const durationMS = firstEndDT.diff(firstStartDT).milliseconds;

  const intervalMS = (eventTypes.periodic)
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
    description: event.description,
  };
};

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
