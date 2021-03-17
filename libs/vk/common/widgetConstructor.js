import _ from 'lodash';
import luxon from 'luxon';

const { DateTime } = luxon;

const createFormat = (start, end = '') => ({ start, end });
const getDateFormat = (datetype) => ((datetype === 'date')
  ? createFormat("'с' dd.MM", "'до' dd.MM")
  : createFormat("'с' HH:mm dd.MM", "'до' HH:mm dd.MM"));

const bodyConstructor = (calendar, appUrl = null) => {
  const { timezone, events } = calendar;

  if (events.length === 0) {
    const rows = [
      {
        title: 'Здесь будут показаны ближайшие мероприятия',
        descr: 'Пока что вы можете изучить возможности приложения',
        time: 'Виджет будет регулярно обновляться',
        title_url: appUrl,
      },
      {
        title: 'Прочитайте статью про google-календарь',
        descr: 'Она иллюстрирует основные возможности и преимущества сервиса',
        time: '5 минут',
        title_url: '//vk.com/@samelodyn-google-calendar-basics',
      },
    ];

    return { rows };
  }

  const maxTitleLength = 100;
  const maxDescriptionLength = 100;
  const maxElementsCount = 6;

  const rows = _.take(events, maxElementsCount)
    .map(({
      summary,
      datetype,
      description,
      startMS,
      endMS,
    }) => {
      const { start: startFormat, end: endFormat } = getDateFormat(datetype);
      const eventStartDate = DateTime.fromMillis(startMS).setZone(timezone).toFormat(startFormat);
      const eventEndDate = DateTime.fromMillis(endMS).setZone(timezone).toFormat(endFormat);

      return {
        title: _.truncate(summary, { length: maxTitleLength }),
        descr: _.truncate(description, { length: maxDescriptionLength }),
        time: `${eventStartDate} ${eventEndDate}`.trim(),
      };
    });

  return { rows };
};

const widgetGenerator = (appId, calendar) => {
  const { clubId, timezone } = calendar;

  const body = bodyConstructor(calendar);
  const currentDateTime = DateTime.local().setZone(timezone).toFormat("dd.MM 'в' HH:mm");
  const title = `${currentDateTime} (${timezone}) обновлено`;
  const more = 'Перейти в календарь';
  const more_url = `//vk.com/app${appId}_-${clubId}`;

  const widget = {
    title,
    more,
    more_url,
    ...body,
  };

  return {
    ...calendar,
    widget,
  };
};

const emptyWidgetGenerator = () => {
  const title = 'Убедитесь, что виджет доступен подписчикам ->';
  const rows = [{
    title: 'Управление — Приложения — Видимость виджета приложения',
    descr: 'Эта настройка доступна в полной web-версии сайта',
    time: 'Мероприятия появятся здесь в течение 10 минут',
  }];

  const widget = {
    title,
    rows,
  };

  return {
    widget,
  };
};

export default (apiVersion, appId) => {
  const widgetType = 'list';

  return (widgetToken, calendar = null) => {
    const updatedCalendar = (calendar === null)
      ? emptyWidgetGenerator()
      : widgetGenerator(appId, calendar);
    const { widget } = updatedCalendar;

    const params = {
      type: widgetType,
      code: `return ${JSON.stringify(widget)};`,
      v: apiVersion,
      access_token: widgetToken,
    };

    return { params, widget, calendar: updatedCalendar };
  };
};
