import _ from 'lodash';
import luxon from 'luxon';
import rrule from 'rrule';
import errors from '../../utils/errors.cjs';

const { CronTaskError } = errors;

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

export const prepareEvents = (event, reporter) => {
  try {
    const type = _.has(event, 'rrule') ? eventTypes.periodic : eventTypes.once;
    const startMS = toMS(event.start);
    const endMS = toMS(event.end);
    const nowMS = getDateNowMS();

    const firstStartDT = DateTime.fromMillis(startMS);
    const firstEndDT = DateTime.fromMillis(endMS);
    const durationMS = firstEndDT.diff(firstStartDT).milliseconds;

    if (type === eventTypes.once) {
      return {
        type,
        startMS,
        endMS,
        isFinished: nowMS >= endMS,
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
    const nearestStart = rule.after(new Date(nowMS), true);
    const previousStart = rule.before(new Date(nowMS), true);
    const isFinished = (nearestStart === null);
    if (isFinished) return { isFinished };

    if (previousStart !== null) {
      const previousStartMS = previousStart.getTime();
      const previousStartDT = DateTime.fromMillis(previousStartMS);
      const previousEndDT = previousStartDT.plus({ milliseconds: durationMS });
      const previousEndMS = previousEndDT.toMillis();

      if (previousEndMS >= nowMS) {
        return {
          type,
          startMS: previousStartMS,
          endMS: previousEndMS,
          isFinished: nowMS >= previousEndMS,
          durationMS,
          summary: event.summary,
          datetype: event.datetype,
          description: event.description,
        };
      }
    }

    const nearestStartMS = nearestStart.getTime();
    const nearestStartDT = DateTime.fromMillis(nearestStartMS);
    const nearestEndDT = nearestStartDT.plus({ milliseconds: durationMS });
    const nearestEndMS = nearestEndDT.toMillis();

    return {
      type,
      startMS: nearestStartMS,
      endMS: nearestEndMS,
      isFinished: nowMS >= nearestEndMS,
      durationMS,
      summary: event.summary,
      datetype: event.datetype,
      description: event.description,
    };
  } catch (e) {
    const error = new CronTaskError(e, { event });
    reporter.error(error);

    return { isFinished: true };
  }
};
