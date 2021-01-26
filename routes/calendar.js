import yup from 'yup';
import { buildCalendarLinks } from '../utils/helpers.js';

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

      const formActionUrl = req.url;
      const { timezones } = this;

      if (clubCalendar) {
        const { embed } = buildCalendarLinks(clubCalendar.calendarId, clubCalendar.timezone);
        clubCalendar.extra.calendarLink = embed;
        res.render('calendar', { calendar: clubCalendar, formActionUrl, timezones });
      } else {
        res.render('noCalendar', { formActionUrl, timezones });
      }
    },
  },
  {
    method: 'POST',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkAdminAuth])(...params);
    },
    async handler(req, res) {
      const allowedZones = this.timezones.all.map(({ name }) => name);
      const {
        calendarId,
        timezone,
        widgetToken,
      } = await yup
        .object({
          calendarId: yup.string()
            .matches(/^.+@(group.calendar.google.com|gmail.com)$/)
            .required(),
          timezone: yup.string().oneOf(allowedZones).required(),
          widgetToken: yup.string().default('').optional(),
        })
        .required()
        .validate(req.body);

      const clubId = req.user.groupId;
      const clubRepository = this.db.getRepository('Calendar');
      const calendarBody = {
        clubId,
        calendarId,
        timezone,
        widgetToken: (widgetToken === '') ? null : widgetToken,
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
    url: '/install',
    handler(req, res) {
      res.render('main', { appId: this.config.VK_APP_ID });
    },
  },
];

export default routes;
