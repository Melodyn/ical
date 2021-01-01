const routes = [
  {
    method: 'GET',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkUserAuth])(...params);
    },
    async handler(req, res) {
      const calendarRepository = this.db.getRepository('Calendar');
      const clubCalendar = await calendarRepository.findOne({ clubId: req.user.groupId });

      const calendarRender = (user, calendar) => {
        if (calendar) {
          const { calendarLink } = calendar.extra;
          const calendarFrame = `<iframe src="${calendarLink}" style="border: 0" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>`;
          const calendarForm = user.isAdmin
            ? [
              `<form action="${req.url}" method="post">`,
              '<input type="submit" value="Изменить">',
              `<input id="calendarLink" name="calendarLink" type="url" width="50%" value="${calendarLink}">`,
              '</form>',
              '<br/><br/>',
            ]
            : [];

          return calendarForm.concat(calendarFrame);
        }

        return (user.isAdmin)
          ? [
            `<form action="${req.url}" method="post">`,
            '<input type="submit" value="Сохранить">',
            '<input id="calendarLink" name="calendarLink" type="url" width="50%" value="">',
            '</form>',
            '<br/><br/>',
            `<p>Укажите общедоступную ссылку на календарь вида
<span style="font-family: monospace">https://calendar.google.com/calendar/embed?src=ob1gcsbo877671s4295f693nv0%40group.calendar.google.com&ctz=Europe%2FMoscow</span>
и сохраните, чтобы привязать календарь к сообществу.
</p>`,
          ]
          : [
            '<p>В данном сообществе пока отсутствует календарь</p>',
          ];
      };

      const calendarHTML = calendarRender(req.user, clubCalendar).join('\n');

      res.type('text/html; charset=utf-8').send(calendarHTML);
    },
  },
  {
    method: 'POST',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkAdminAuth])(...params);
    },
    async handler(req, res) {
      if (!req.body.calendarLink) {
        return res.code(400).send('Обязательно указать поле "calendarLink" в теле запроса');
      }
      const { calendarLink } = req.body;
      const calendarId = (new URL(calendarLink)).searchParams.get('src');
      if (!calendarId) {
        return res.code(400).send(`Не найдено идентификатора календаря в url "${calendarLink}"`);
      }
      const clubRepository = this.db.getRepository('Calendar');
      await clubRepository.save({
        clubId: req.query.vk_group_id,
        calendarId,
        extra: { calendarLink },
      });
      return res.redirect(req.url);
    },
  },
  {
    method: 'GET',
    url: '/',
    handler(req, res) {
      const appId = this.config.VK_APP_ID;
      const appLink = `https://vk.com/add_community_app.php?aid=${appId}`;
      const html = [
        '<center>',
        '<h3>Приложению требуется установка</h3>',
        '<p>Добавьте приложение в сообщество по ссылке:<br/>',
        `<a href="${appLink}" target="_blank">${appLink}</a>`,
        '</p>',
        '</center>',
      ];
      res.type('text/html; charset=utf-8').send(html.join('\n'));
    },
  },
];

export default routes;
