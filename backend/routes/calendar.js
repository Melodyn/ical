import yup from 'yup';
import _ from 'lodash';
import luxon from 'luxon';

const { DateTime } = luxon;

const range = (count) => Array.from(Array(count));

const routes = [
  {
    method: 'GET',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkUserAuth])(...params);
    },
    async handler(req, res) {
      const action = this.container.has('action') ? this.container.get('action') : null;
      const formActionUrl = req.url;
      if (req.user.userId === 229425562) {
        this.services.reporter.info(JSON.stringify({
          log: 'GET',
          user: req.user,
          action,
          body: req.body,
          url: req.url,
        }));
      }

      if (action === 'help') {
        this.container.set('action', null);
        if (req.user.userId === 229425562) {
          this.services.reporter.info(JSON.stringify({
            log: "if (action === 'help')",
          }));
        }
        return res.render('help', { isAction: true, formActionUrl });
      }

      if (!req.isAuthenticated || action === 'install') {
        this.container.set('action', null);
        if (req.user.userId === 229425562) {
          this.services.reporter.info(JSON.stringify({
            log: "if (action === 'install')",
          }));
        }
        return res.render('install', {
          isAction: req.isAuthenticated,
          formActionUrl,
        });
      }

      const calendarRepository = this.db.getRepository('Calendar');
      const clubCalendar = await calendarRepository.findOne({ clubId: req.user.groupId });

      const { timezones, services: { icalService } } = this;

      if (clubCalendar) {
        if (!clubCalendar.extra.ical) {
          return res.render('noCalendar', { formActionUrl, timezones, calendarId: clubCalendar.calendarId });
        }

        const { COUNT_DAYS_ON_VIEW } = this.config;
        const localNow = DateTime.now();
        const upcomingEvents = icalService.toEvents(clubCalendar.extra.ical, {
          nextDays: COUNT_DAYS_ON_VIEW,
          fromDate: localNow,
        });
        const msToDT = (ms) => DateTime.fromMillis(ms).setZone(clubCalendar.timezone);
        const rangeOfDates = icalService.rangeDates(COUNT_DAYS_ON_VIEW, localNow);
        const eventsByDays = rangeOfDates.map((day) => {
          const dateOfDay = day;
          const msOfDay = day.toMillis();
          const eventsOfDay = upcomingEvents
            .filter(({ referenceMS }) => referenceMS === msOfDay)
            .map((event) => {
              const { referenceMS, startMS, endMS } = event;

              return {
                referenceDT: msToDT(referenceMS),
                startDT: msToDT(startMS),
                endDT: msToDT(endMS),
                ...event,
              };
            });

          return [dateOfDay, eventsOfDay];
        });

        const emptyDaysHeadCount = (localNow.weekday - 1) % 7;
        const filledDaysCount = (rangeOfDates.length + emptyDaysHeadCount) % 7;
        const emptyDaysTailCount = (7 - filledDaysCount) % 7;
        const emptyDaysHead = range(emptyDaysHeadCount);
        const emptyDaysTail = range(emptyDaysTailCount);
        const fullMonthWeeks = emptyDaysHead.concat(eventsByDays).concat(emptyDaysTail);
        const eventsByWeeks = fullMonthWeeks.reduce((acc, event, weekday) => {
          const isWeekdayStart = weekday % 7 === 0;
          const currentWeekday = isWeekdayStart ? [] : acc[acc.length - 1];
          currentWeekday.push(event);

          return isWeekdayStart ? acc.concat([currentWeekday]) : acc;
        }, []);

        const { embed, subscribe } = icalService.buildLinks(
          clubCalendar.calendarId,
          clubCalendar.timezone,
        );
        clubCalendar.calendarLink = embed;
        clubCalendar.subscribeLink = subscribe;
        clubCalendar.events = eventsByWeeks;
        return res.render('calendar', { calendar: clubCalendar, formActionUrl, timezones });
      }
      return res.render('noCalendar', { formActionUrl, timezones, calendarId: null });
    },
  },
  {
    method: 'POST',
    url: '/calendar',
    preHandler(...params) {
      return this.auth([this.vkUserAuth])(...params);
    },
    async handler(req, res) {
      const { action } = req.body;
      if (req.user.userId === 229425562) {
        this.services.reporter.info(JSON.stringify({
          log: 'POST',
          user: req.user,
          action,
          body: req.body,
          url: req.url,
        }));
      }

      if (action) {
        this.container.set('action', action);
        return res.redirect(req.url);
      }

      // 229425562

      if (!req.user.isAdmin) {
        res.code(401).send(`Access denied for user with role "${req.user.viewerGroupRole}"`);
      }

      const allowedZones = this.timezones.all.map(({ name }) => name);
      const {
        calendarId,
        timezone,
        widgetToken,
        errors = null,
      } = await yup
        .object({
          action: yup.string().default('').optional(),
          calendarId: yup.string()
            .matches(
              /^.+@.*(calendar.google.com|gmail.com)$/,
              { message: 'Идентификатор должен быть вида email-адреса и оканчиваться на calendar.google.com или gmail.com' },
            )
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
      const createCalendarBody = (previousData = null) => ({
        ...previousData,
        clubId,
        calendarId,
        timezone,
        extra: {
          ...(_.isObject(previousData) ? (previousData.extra || {}) : {}),
          ical,
          icalError: null,
        },
        ...((widgetToken === '') ? null : { widgetToken }),
      });

      await clubRepository
        .findOne({ clubId })
        .then((calendar) => {
          const calendarBody = createCalendarBody(calendar || null);

          if (!calendar) { // первая установка календаря
            calendarBody.extra.wasFirstWidget = false;
            return clubRepository.insert(calendarBody);
          }

          const isFirstWidgetInstall = (calendar.extra.wasFirstWidget === false)
            && (widgetToken.length > 1);

          if (isFirstWidgetInstall) { // первая установка виджета
            const widget = this.services.vkService.createWidget(widgetToken);

            return this.services.vkService.updateWidget(widget)
              .catch((error) => {
                this.services.reporter.error(error);
                return { isWidgetUpdateError: true, error };
              })
              .then((result) => {
                if (result && result.isWidgetUpdateError) {
                  calendarBody.extra.widgetError = result.error;
                } else {
                  req.flash([
                    [
                      'success',
                      `Виджет установлен! Посмотрите его <a href="//vk.com/club${clubId}" class="alert-link" target="_blank">в&nbsp;сообществе</a>`,
                    ],
                  ]);
                  calendarBody.extra.wasFirstWidget = true;
                }

                return clubRepository.update(calendar.id, calendarBody);
              });
          }

          // остальные обновления
          return clubRepository.update(calendar.id, calendarBody);
        });

      return res.redirect(req.url);
    },
  },
  {
    method: 'GET',
    url: '/install',
    handler(req, res) {
      res.render('install');
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
      res.render('main');
    },
  },
];

export default routes;
