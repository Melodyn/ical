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

const eventHumanable = (event) => { // TODO добавить { includeForDays: n }
  const type = _.has(event, 'rrule') ? eventTypes.periodic : eventTypes.once;
  const eventStartMS = toMS(event.start);
  const eventEndMS = toMS(event.end);
  const nowMS = getDateNowMS();

  const firstStartDT = DateTime.fromMillis(eventStartMS);
  const firstEndDT = DateTime.fromMillis(eventEndMS);
  const durationMS = firstEndDT.diff(firstStartDT).milliseconds;
  const createEvent = ({ isFinished, startMS = eventStartMS, endMS = eventEndMS }) => ({
    type,
    startMS,
    endMS,
    durationMS,
    isFinished,
    summary: event.summary,
    datetype: event.datetype,
    description: event.description,
  });

  if (type === eventTypes.once) {
    return createEvent({ isFinished: nowMS >= eventEndMS });
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
  const startBeforeNow = rule.before(new Date(nowMS), true);
  const startAfterNow = rule.after(new Date(nowMS), true);

  const isMaybeActiveEvent = (startBeforeNow !== null);
  const isUpcomingEvent = (startAfterNow !== null);

  const hasStartDate = (isMaybeActiveEvent || isUpcomingEvent);
  if (!hasStartDate) return createEvent({ isFinished: !hasStartDate });

  if (isMaybeActiveEvent) { // кейс: второй день трёхдневного мероприятия
    const startMS = startBeforeNow.getTime();
    const startDT = DateTime.fromMillis(startMS);
    const endDT = startDT.plus({ milliseconds: durationMS });
    const endMS = endDT.toMillis();
    const isFinished = (nowMS >= endMS);

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
  const isFinished = (nowMS >= endMS);

  return createEvent({ startMS, endMS, isFinished });
};

fromFile('./27.02.2021.ics')
  .then((events) => events.filter(({ type }) => type === 'VEVENT'))
  .then((events) => events.map(eventHumanable))
  .then((events) => events.filter(({ isFinished }) => !isFinished))
  .then((events) => _.sortBy(events, 'startMS'))
  .then(console.log)
  .catch(console.error);
