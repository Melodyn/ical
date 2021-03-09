export default (calendarId, timezone = '') => {
  const baseURL = 'https://calendar.google.com/calendar';
  const icalPath = `/ical/${calendarId}/public/basic.ics`;
  const embedPath = '/embed';
  const subscribePath = '/r/settings/addcalendar';

  const icalURL = new URL(icalPath, baseURL);

  const subscribeURL = new URL(subscribePath, baseURL);
  subscribeURL.searchParams.set('cid', calendarId);

  const embedURL = new URL(embedPath, baseURL);
  embedURL.searchParams.set('src', calendarId);
  embedURL.searchParams.set('ctz', timezone);

  return {
    embed: embedURL.toString(),
    ical: icalURL.toString(),
    subscribe: subscribeURL.toString(),
  };
};
