/* eslint-disable */

import luxon from 'luxon';
import typeorm from 'typeorm';
import axios from 'axios';
import _ from 'lodash';

const { DateTime } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

const widget = {
  title: 'Заголовок 1',
  head: [{ text: 'Столбец 1' }],
  body: [
    [{ text: 'Некоторое значение в столбце, длиной ровно 100 символов, чтобы проверить сколько текста отображается' }],
  ],
};
const json = JSON.stringify(widget);

const createWidget = () => {};

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

const syncWidget = async (period) => {
  const calendarRepo = getConnection().getRepository('Calendar');
  const updateDate = DateTime.local().minus(period).toSQL();

  const calendarsForWidget = await calendarRepo.find({
    widgetToken: Not(IsNull()),
    widgetSyncedAt: LessThan(updateDate),
  });

  const plainCalendars = calendarsForWidget
    .map(({ id, widgetToken, extra: { ical } }) => ({
      id,
      widgetToken,
      ical,
    }))
    .map(({ ical, ...other }) => {
      const widgetRows = _.take(ical, 10);
    });
};
