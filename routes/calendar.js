import yup from 'yup';
import renderApp from '../templates/calendar.js';
import renderMain from '../templates/main.js';

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
      const calendarHTML = renderApp(req.user, clubCalendar, req.url);

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
      const { calendarLink } = await yup
        .object({
          calendarLink: yup
            .string()
            .url()
            .matches(/^https:\/\/calendar\.google\.com\/calendar\/embed\?src=.+[@|%40][group.calendar.google.com|gmail.com].*$/)
            .required(),
        })
        .required()
        .validate(req.body);

      const clubId = req.user.groupId;
      const calendarId = (new URL(calendarLink)).searchParams.get('src');
      const clubRepository = this.db.getRepository('Calendar');
      const calendarBody = {
        clubId,
        calendarId,
        extra: { calendarLink },
      };

      await clubRepository
        .findOne({ clubId })
        .then((calendar) => (calendar
          ? clubRepository.update(calendar.id, calendarBody)
          : clubRepository.insert(calendarBody)));

      return res.redirect(req.url);
    },
  },
  {
    method: 'GET',
    url: '/',
    handler(req, res) {
      res.type('text/html; charset=utf-8').send(renderMain(this.config.VK_APP_ID));
    },
  },
];

export default routes;
