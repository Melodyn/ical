const routes = [
  {
    method: 'GET',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkUserAuth])(...params);
    },
    async handler(req, res) {
      const clubRepository = this.db.getRepository('Calendar');
      const clubs = await clubRepository.find();
      res.send(JSON.stringify(clubs));
    },
  },
  {
    method: 'POST',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkAdminAuth])(...params);
    },
    async handler(req, res) {
      const clubRepository = this.db.getRepository('Calendar');
      await clubRepository.save({
        clubId: req.query.vk_group_id,
        calendarId: req.body.calendarId,
      });
      res.send('ok');
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
