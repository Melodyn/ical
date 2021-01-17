import axios from 'axios';
import luxon from 'luxon';

const { DateTime } = luxon;

export default (
  {
    VK_APP_ID,
    VK_WIDGET_TYPE,
    VK_API_VERSION,
  },
  widgetConstructor,
) => {
  const create = (calendar) => {
    const { clubId, timezone } = calendar;

    const body = widgetConstructor(calendar);
    const currentDateTime = DateTime.local().setZone(timezone).toFormat("dd.MM 'в' HH:mm");
    const title = `обновлено ${currentDateTime}`;
    const more = 'Перейти в календарь';
    const more_url = `//vk.com/app${VK_APP_ID}_-${clubId}`;

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

  const send = ({ widgetToken, widget }) => axios
    .get(
      'https://api.vk.com/method/appWidgets.update',
      {
        params: {
          type: VK_WIDGET_TYPE,
          code: `return ${JSON.stringify(widget)};`,
          v: VK_API_VERSION,
          access_token: widgetToken,
        },
      },
    )
    .then(({ data }) => data);

  return {
    create,
    send,
  };
};
