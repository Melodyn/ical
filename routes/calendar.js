import yup from 'yup';

const routes = [
  {
    method: 'GET',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkUserAuth])(...params);
    },
    async handler(req, res) {
      if (!req.isAuthenticated) {
        res.render('install', { appId: this.config.VK_APP_ID });
      }

      const calendarRepository = this.db.getRepository('Calendar');
      const clubCalendar = await calendarRepository.findOne({ clubId: req.user.groupId });

      const formActionUrl = req.url;
      const { timezones, services: { icalService } } = this;

      if (clubCalendar) {
        const { COUNT_DAYS_ON_VIEW } = this.config;
        const upcomingEvents = icalService.toEvents(clubCalendar.extra.ical, {
          nextDays: COUNT_DAYS_ON_VIEW,
        });
        const rangeOfDates = icalService.rangeDates(COUNT_DAYS_ON_VIEW);
        const eventsByDays = rangeOfDates.map((day) => {
          const dateOfDay = day.toFormat('dd.MM.yyyy');
          const msOfDay = day.toMillis();
          const eventsOfDay = upcomingEvents.filter(({ referenceMS }) => referenceMS === msOfDay);

          return [dateOfDay, eventsOfDay];
        });

        const { embed } = icalService.buildLinks(clubCalendar.calendarId, clubCalendar.timezone);
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
        errors = null,
      } = await yup
        .object({
          calendarId: yup.string()
            .matches(/^(\w|\.)+@(group.calendar.google.com|gmail.com)$/)
            .required(),
          timezone: yup.string().oneOf(allowedZones).required(),
          widgetToken: yup.string().default('').optional(),
        })
        .required()
        .validate(req.body, { abortEarly: false })
        .catch((err) => {
          const validationErrors = err.inner.map((error) => [
            error.path,
            { value: error.value, message: error.message },
          ]);

          return { errors: validationErrors };
        });

      if (errors !== null) {
        req.errors(errors);
        return res.redirect(req.url);
      }

      const ical = await this.services.icalService
        .load(calendarId)
        .catch(() => null);

      const isPublic = ical !== null;

      if (!isPublic) {
        req.errors([
          [
            'calendarId',
            {
              value: calendarId,
              message: `Проверьте, что календарь "${calendarId}" общедоступный. Не удалось получить данных.`,
            },
          ],
        ]);
        return res.redirect(req.url);
      }

      const clubId = req.user.groupId;
      const clubRepository = this.db.getRepository('Calendar');
      const calendarBody = {
        clubId,
        calendarId,
        timezone,
        extra: { ical },
        ...((widgetToken === '') ? null : { widgetToken }),
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
      res.render('install', { appId: this.config.VK_APP_ID });
    },
  },
  {
    method: 'GET',
    url: '/help',
    handler(req, res) {
      res.render('help');
    },
  },
  {
    method: 'GET',
    url: '/',
    handler(req, res) {
      res.render('main', { appId: this.config.VK_APP_ID });
    },
  },
];

export default routes;
