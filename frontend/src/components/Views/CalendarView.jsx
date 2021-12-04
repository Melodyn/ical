import React from 'react';
import {
  Group, Panel, PanelHeader, Header, View, SimpleCell, Gradient,
} from '@vkontakte/vkui';
import { DateTime, Info } from 'luxon';
import uniqueId from 'lodash/uniqueId.js';
import { useTranslations } from '../../../hooks';
import rangeDates from '../../../libs/rangeDates.js';

const CalendarView = (props) => {
  const [translation, { language }] = useTranslations();
  const t = (name, options) => translation(`page.calendar.${name}`, options);
  const { id, activePanel, history } = props;

  const tableEl = React.useRef(null);
  const eventListContainerEl = React.useRef(null);
  React.useLayoutEffect(() => {
    eventListContainerEl.current.style.minHeight = `${tableEl.current.clientHeight}px`;
  });

  const daysRangeCount = 30;
  const datesRange = rangeDates(daysRangeCount, DateTime.now());
  const [startDay] = datesRange;
  const startWeekday = startDay.weekday;
  const weeks = [];
  const days = [];
  const weekdays = Info.weekdays('short', { locale: language })
    .map((name) => name.substring(0, 2));

  let weekDayCounter = 1;
  let weekCounter = 1;
  let rangeCounter = 0;
  let isLastDayOfWeek = false;
  let rangeIsCompleted = false;

  do {
    const weekIndex = weekCounter - 1;
    if (!weeks[weekIndex]) weeks.push([]);
    const week = weeks[weekIndex];

    if (weekDayCounter >= startWeekday) {
      const day = rangeCounter >= daysRangeCount ? null : datesRange[rangeCounter];
      week.push(day);
      if (day) days.push(day);
      rangeCounter += 1;
    } else {
      week.push('');
    }

    isLastDayOfWeek = (weekDayCounter % 7 === 0);
    if (isLastDayOfWeek) {
      weekCounter += 1;
    }
    weekDayCounter += 1;

    rangeIsCompleted = rangeCounter >= daysRangeCount;
  } while (!(rangeIsCompleted && isLastDayOfWeek));

  // eslint-disable-next-line react/no-unstable-nested-components
  const Table = () => (
    <table
      ref={tableEl}
      className="table table-default table-bordered user-select-none"
      id="calendar"
    >
      <thead className="table-dark text-center">
        <tr className="align-middle">
          {weekdays.map((name) => (
            <th
              key={uniqueId()}
              className="px-0 font-monospace"
              scope="col"
            >
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-end">
        {weeks.map((dates) => {
          const cells = dates.map((date) => (
            <th key={uniqueId()} scope="col" className="fw-normal bg-light">
              {date ? date.day.toString().padStart(2, '0') : ''}
            </th>
          ));
          const row = <tr key={uniqueId()} className="align-middle">{cells}</tr>;
          return row;
        })}
      </tbody>
    </table>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const EventsList = () => (
    <dl className="list-group rounded-0">
      {days.map((day, i) => (
        <React.Fragment key={uniqueId()}>
          <dt className="list-group-item sticky-top bg-dark fw-bold font-monospace text-light text-end pe-4 m-0">
            {day.toFormat('dd-LL-y')}
          </dt>
          <dd className="list-group-item bg-light">{i + 1}</dd>
        </React.Fragment>
      ))}
    </dl>
  );

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader role="heading" shadow style={{ zIndex: 1025 }}>
          {t('header')}
        </PanelHeader>
        <Group>
          <Gradient
            className="p-2"
            style={{
              margin: '-7px -7px 0 -7px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Header className="mb-2" mode="primary" multiline>
              {t('group.calendar.header', {
                daysCount: daysRangeCount,
                timezone: DateTime.now().zoneName,
                interpolation: { escapeValue: false },
              })}
            </Header>
            <div className="container-fluid">
              <div className="row g-2">
                <div className="col-sm">
                  <Table />
                </div>
                <div
                  ref={eventListContainerEl}
                  className="col-sm overflow-auto"
                  id="container-calendar-events"
                >
                  <EventsList />
                </div>
              </div>
            </div>
          </Gradient>
          <Group mode="plain">
            <Header mode="primary">{t('group.action.header')}</Header>
            <SimpleCell>{t('group.action.open')}</SimpleCell>
            <SimpleCell>{t('group.action.subscribe')}</SimpleCell>
            <SimpleCell>{t('group.action.help')}</SimpleCell>
          </Group>
        </Group>
      </Panel>
    </View>
  );
};

export default CalendarView;
