export const buildCalendarLinks = (calendarId, timezone = '') => {
  const baseURL = 'https://calendar.google.com/calendar';
  const icalPath = `/ical/${calendarId}/public/basic.ics`;
  const embedPath = '/embed';

  const embedURL = new URL(embedPath, baseURL);
  embedURL.searchParams.set('src', calendarId);
  embedURL.searchParams.set('ctz', timezone);

  const icalURL = new URL(icalPath, baseURL);

  return {
    embed: embedURL.toString(),
    ical: icalURL.toString(),
  };
};

// const { Interval, DateTime} = require("luxon");
//
// // adjust this for your exact needs
// function* days(interval) {
//   let cursor = interval.start.startOf("day");
//   while (cursor < interval.end) {
//     yield cursor;
//     cursor = cursor.plus({ days: 1 });
//   }
// }
//
// let start = DateTime.local();
// let end = DateTime.local(2020, 10, 17);
// let interval = Interval.fromDateTimes(start, end);
//
// // you can iterate over it
// for(var d of days(interval)) {
//   console.log(d.toISO())
// }
//
// // or construct an array out of it
// var arr = Array.from(days(interval));
// console.log(arr.length);

export const noop = () => {};
