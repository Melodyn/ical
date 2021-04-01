import _ from 'lodash';
import { htmlEscape } from 'escape-goat';
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

  const maxTitleLength = 90;
  const maxDescriptionLength = 90;
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

      // vk парсит текст как html и строка <a> будет превращена в
      // &lt;a&gt; -> &amp;lt;a&amp;gt; - 17 символов вместо 3
      const escapedSummary = htmlEscape(summary);
      const escapedDescription = htmlEscape(description);
      const summaryLengthDiff = escapedSummary.length - summary.length;
      const descriptionLengthDiff = escapedDescription.length - description.length;

      return {
        title: _.truncate(htmlEscape(summary), {
          length: (maxTitleLength - summaryLengthDiff),
        }),
        descr: _.truncate(htmlEscape(description), {
          length: (maxDescriptionLength - descriptionLengthDiff),
        }),
        time: `${eventStartDate} ${eventEndDate}`.trim(),
      };
    });

  return { rows };
};

const widgetGenerator = (appId, calendar) => {
  const { clubId, timezone } = calendar;

  const more_url = `//vk.com/app${appId}_-${clubId}`;
  const body = bodyConstructor(calendar, more_url);
  const currentDateTime = DateTime.local().setZone(timezone).toFormat("dd.MM 'в' HH:mm");
  const title = `${currentDateTime} (${timezone}) обновлено`;
  const more = 'Перейти в календарь';

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
  const rows = [
    {
      title: 'Откройте vk.com и перейдите в настройки сообщества',
      descr: 'Там можно установить видимость виджета',
    },
    {
      title: 'Управление — Приложения — Видимость виджета приложения',
      descr: 'В контекстном меню справа',
    },
    {
      title: 'Виджет будет обновлён автоматически',
      time: 'Мероприятия появятся здесь в течение 10 минут',
    },
  ];

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
