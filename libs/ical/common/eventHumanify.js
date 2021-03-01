import _ from 'lodash';
import luxon from 'luxon';
import rrule from 'rrule';
import { fromFile } from './parser.js';

const { RRule } = rrule;
const { DateTime } = luxon;

export const eventTypes = {
  periodic: 'periodic',
  once: 'once',
};
export const toMS = (date) => (new Date(date)).getTime();
export const getDateNowMS = () => Date.now();

const eventHumanify = (event, referenceMS = DateTime.now().toMillis()) => {
  const type = _.has(event, 'rrule') ? eventTypes.periodic : eventTypes.once;
  const eventStartMS = toMS(event.start);
  const eventEndMS = toMS(event.end);

  const firstStartDT = DateTime.fromMillis(eventStartMS);
  const firstEndDT = DateTime.fromMillis(eventEndMS);
  const durationMS = firstEndDT.diff(firstStartDT).milliseconds;
  const createEvent = ({ isFinished, startMS = eventStartMS, endMS = eventEndMS }) => ({
    type,
    referenceMS,
    startMS,
    endMS,
    durationMS,
    isFinished,
    summary: event.summary,
    datetype: event.datetype,
    description: event.description,
  });

  if (type === eventTypes.once) {
    return createEvent({ isFinished: referenceMS >= eventEndMS });
  }

  const filledRrules = Object.fromEntries(
    Object // кейс: правила, которые могли бы быть установлены, но не установлены
      .entries(event.rrule.options) // будут пустым массивом / null / undefined,
      .filter(([, value]) => { // поэтому выбираются только заполненные поля
        if (_.isArray(value) && _.isEmpty(value)) return false;
        return !_.isNil(value);
      })
      .map(([key, value]) => [
        key,
        (key === 'dtstart' || key === 'until') ? new Date(value) : value,
      ]),
  );

  const rule = new RRule(filledRrules);
  const startBeforeNow = rule.before(new Date(referenceMS), true);
  const startAfterNow = rule.after(new Date(referenceMS), true);

  const isMaybeActiveEvent = (startBeforeNow !== null);
  const isUpcomingEvent = (startAfterNow !== null);

  const hasStartDate = (isMaybeActiveEvent || isUpcomingEvent);
  if (!hasStartDate) return createEvent({ isFinished: !hasStartDate });

  if (isMaybeActiveEvent) { // кейс: второй день трёхдневного мероприятия
    const startMS = startBeforeNow.getTime();
    const startDT = DateTime.fromMillis(startMS);
    const endDT = startDT.plus({ milliseconds: durationMS });
    const endMS = endDT.toMillis();
    const isFinished = (referenceMS >= endMS);

    if (!isFinished) {
      return createEvent({ startMS, endMS, isFinished });
    }
  }

  // кейс: периодическое событие было вчера последний раз
  // и попало в isMaybeActiveEvent, но там оказалось завершённым
  if (!isUpcomingEvent) return createEvent({ isFinished: !isUpcomingEvent });

  const startMS = startAfterNow.getTime();
  const startDT = DateTime.fromMillis(startMS);
  const endDT = startDT.plus({ milliseconds: durationMS });
  const endMS = endDT.toMillis();
  const isFinished = (referenceMS >= endMS);

  return createEvent({ startMS, endMS, isFinished });
};

export default eventHumanify;

const prepareEventForWidget = eventHumanify;

const prepareEventForCalendar = (event, { nextDays = 0 }) => {
  const nowDT = DateTime.now();

  let day = 0;
  let events = [];
  do {
    const referenceDT = nowDT.plus({ day }).startOf('day');
    const processedEvent = eventHumanify(event, referenceDT.toMillis());
    const { days } = DateTime.fromMillis(processedEvent.startMS).diff(referenceDT, 'days').toObject();

    if (days < 1) {
      events = events.concat(processedEvent);
    }
    day += 1;
  } while (day < (nextDays + 1));

  return events;
};

fromFile('./01.03.2021.ics')
  .then((events) => events.filter(({ type }) => type === 'VEVENT'))
  .then((events) => events.flatMap((event) => prepareEventForCalendar(event, { nextDays: 30 })))
  .then((events) => events.filter(({ isFinished }) => !isFinished))
  .then((events) => _.sortBy(events, ['referenceMS', 'startMS'])) // prepareEventForWidget
  // .then((events) => _.sortBy(events, ['startMS'])) // prepareEventForWidget
  .then(console.log)
  .catch(console.error);
