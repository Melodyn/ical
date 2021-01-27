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
export const createFormat = (start, end = '') => ({ start, end });
export const getDateFormat = (datetype) => ((datetype === 'date')
  ? createFormat("'с' dd.MM", "'до' dd.MM")
  : createFormat("'с' HH:mm dd.MM", "'до' HH:mm dd.MM"));

export const prepareEvents = (event) => {
try {
  const type = _.has(event, 'rrule') ? eventTypes.periodic : eventTypes.once;
  const startMS = toMS(event.start);
  const endMS = toMS(event.end);

  const firstStartDT = DateTime.fromMillis(startMS);
  const firstEndDT = DateTime.fromMillis(endMS);
  const durationMS = firstEndDT.diff(firstStartDT).milliseconds;

  if (type === eventTypes.once) {
    return {
      type,
      startMS,
      endMS,
      durationMS,
      summary: event.summary,
      datetype: event.datetype,
      description: event.description,
    };
  }

  const filledRrules = Object.fromEntries(
    Object
      .entries(event.rrule.options)
      .filter(([, value]) => {
        if (_.isArray(value) && _.isEmpty(value)) return false;
        return !_.isNull(value);
      })
      .map(([key, value]) => [
        key,
        (key === 'dtstart' || key === 'until') ? new Date(value) : value,
      ]),
  );

  const rule = new RRule(filledRrules);
  const nearestStartMS = rule.after(new Date(), true).getTime();
  const nearestStartDT = DateTime.fromMillis(nearestStartMS);
  const nearestEndDT = nearestStartDT.plus({ milliseconds: durationMS });

  return {
    type,
    startMS: nearestStartDT.toMillis(),
    endMS: nearestEndDT.toMillis(),
    durationMS,
    summary: event.summary,
    datetype: event.datetype,
    description: event.description,
  };
} catch (e) {
  console.log(event);
  console.error(e);
  return { endMS: Date.now() - 1000 };
}
};
