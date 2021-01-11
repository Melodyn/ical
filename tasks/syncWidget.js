/* eslint-disable */

import luxon from 'luxon';
import typeorm from 'typeorm';
import axios from 'axios';
import _ from 'lodash';

const { DateTime } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

// const widget = {
//   title: 'Заголовок 1',
//   head: [{ text: 'Столбец 1' }],
//   body: [
//     [{ text: 'Некоторое значение в столбце, длиной ровно 100 символов, чтобы проверить сколько текста отображается' }],
//   ],
// };
// const json = JSON.stringify(widget);

const createWidget = ({ clubId, timezone, ical }) => {
  const dateNowMS = Date.now();
  const body = _.take(ical, 10)
    .map(({ summary, startMS }) => {
      const formatDate = (startMS < dateNowMS) ? 'dd.MM' : "dd.MM 'в' HH:mm";
      const eventStartDate = DateTime.fromMillis(startMS).setZone(timezone).toFormat(formatDate);
      const rowText = `${eventStartDate} ${summary}`;

      return { text: _.truncate(rowText, { length: 100 }) };
    });
  const currentDateTime = DateTime.local().setZone(timezone).toFormat("dd.MM 'в' HH:mm");
  const title = `обновлено ${currentDateTime}`;
  const head = [{ text: 'Мероприятия' }];
  const more = 'Перейти в календарь';
  const more_url = `//vk.com/app7703913_-${clubId}`;

  return {
    title,
    head,
    body,
    more,
    more_url,
  };
};

// axios.get('https://api.vk.com/method/appWidgets.update', {
//   params: {
//     type: 'table',
//     code: `return ${json};`,
//     v: 5.126,
//     access_token: token,
//   },
// })
//   .then(console.log)
//   .catch(console.error);

const syncWidget = async (period, maximumEvents = 10) => {
  const calendarRepo = getConnection().getRepository('Calendar');
  const updateDate = DateTime.local().minus(period).toSQL();

  const calendarsForWidget = await calendarRepo.find({
    widgetToken: Not(IsNull()),
    widgetSyncedAt: LessThan(updateDate),
  });

  const dateNowMS = Date.now();
  const toMS = (date) => (new Date(date)).getTime();
  const plainActualCalendars = calendarsForWidget
    .map(({
      id,
      widgetToken,
      clubId,
      timezone,
      extra: { ical },
    }) => ({
      id,
      widgetToken,
      clubId,
      timezone,
      ical: _.sortBy(
        ical.filter(({ end }) => toMS(end) >= dateNowMS),
        [({ start }) => toMS(start)],
      ),
    }))
    .filter(({ ical }) => ical.length > 0);

  const calendarsWithWidget = plainActualCalendars.map(createWidget);
};
