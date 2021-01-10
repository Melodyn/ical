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

export const noop = () => {};
