import _ from 'lodash';
import luxon from 'luxon';
import rrule from 'rrule';

const { RRule } = rrule;
const { DateTime } = luxon;

export const eventTypes = {
  periodic: 'periodic',
  once: 'once',
};
export const toMS = (date) => (new Date(date)).getTime();
export const getDateNowMS = () => Date.now();

export default (event, referenceMS = DateTime.now().toMillis()) => {
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
      .filter(([key, value]) => { // поэтому выбираются только заполненные поля
        if (key === 'tzid') {
          // свойство tzid вызывает warning в библиотеке rrule: https://github.com/jakubroztocil/rrule/issues/427#issuecomment-1053497305
          return false;
        }
        if (_.isArray(value) && _.isEmpty(value)) return false;
        return !_.isNil(value);
      })
      .map(([key, value]) => [
        key,
        (key === 'dtstart' || key === 'until') ? new Date(value) : value,
      ]),
  );

  const rule = new RRule(filledRrules);
  const referenceDate = new Date(referenceMS);
  const startBeforeNow = rule.before(referenceDate, true);
  const startAfterNow = rule.after(referenceDate, true);

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
