import header from './header.js';

const renderForm = (currentUrl, calendarLink = '') => [
  `<form action="${currentUrl}" method="post">`,
  `<input type="submit" style="max-width: 10%" value="${calendarLink ? 'Изменить' : 'Сохранить'}">`,
  `<input id="calendarLink" name="calendarLink" type="url" style="width: 50%" value="${calendarLink}">`,
  '</form>',
  '<hr/>',
  `${calendarLink
    ? ''
    : '<p>Укажите общедоступную ссылку на календарь вида <span style="font-family: monospace">https://calendar.google.com/calendar/embed?src=ob1gcsbo877671s4295f693nv0%40group.calendar.google.com&ctz=Europe%2FMoscow</span> и сохраните, чтобы привязать календарь к сообществу.</p>'}`,
];

const renderApp = (user, calendar, currentUrl) => {
  if (!calendar) {
    const html = user.isAdmin
      ? [header, ...renderForm(currentUrl)]
      : [header, '<p>В данном сообществе пока отсутствует календарь</p>'];

    return html.join('\n');
  }

  const { calendarLink } = calendar.extra;
  const calendarFrame = `<iframe src="${calendarLink}" style="border: 0" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>`;
  const calendarForm = user.isAdmin
    ? renderForm(currentUrl, calendar.extra.calendarLink)
    : [];

  const html = [header].concat(calendarForm, [calendarFrame]);

  return html.join('\n');
};

export default renderApp;
