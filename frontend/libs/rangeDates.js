import { DateTime } from 'luxon';

// const { DateTime } = luxon;

const rangeDates = (count, from = Date.now()) => {
  const start = from instanceof DateTime
    ? from.startOf('day')
    : DateTime.fromMillis(from).startOf('day');

  const range = Array.from(Array(count).keys());

  return range.map((day) => start.plus({ day }));
};

export default rangeDates;
