import React from 'react';
import {
  Group, Panel, PanelHeader, Header, View, SimpleCell, useAppearance, Gradient,
} from '@vkontakte/vkui';
import { DateTime, Info } from 'luxon';
import uniqueId from 'lodash/uniqueId.js';
import { useTranslations } from '../../../hooks';
import rangeDates from '../../../libs/rangeDates.js';

const CalendarView = (props) => {
  const [translation, { language }] = useTranslations();
  const t = (name, options) => translation(`page.calendar.${name}`, options);
  const { id, activePanel, history } = props;

  const daysRangeCount = 30;
  const datesRange = rangeDates(daysRangeCount, DateTime.now());
  const [startDay] = datesRange;
  const startWeekday = startDay.weekday;
  const weeks = [];
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
      const value = rangeCounter >= daysRangeCount ? '' : datesRange[rangeCounter].day;
      week.push(value);
      rangeCounter += 1;
    } else {
      week.push('');
    }

    isLastDayOfWeek = (weekDayCounter > 0) && (weekDayCounter % 7 === 0);
    if (isLastDayOfWeek) {
      weekCounter += 1;
    }
    weekDayCounter += 1;

    rangeIsCompleted = rangeCounter >= daysRangeCount;
  } while (!(rangeIsCompleted && isLastDayOfWeek));

  const appearance = useAppearance();
  const tableAppearance = appearance === 'dark' ? 'secondary' : 'default';
  const Table = () => (
    <table className={`table table-${tableAppearance} table-bordered user-select-none`} id="calendar">
      <thead className="table-dark text-center">
        <tr className="align-middle">
          {weekdays.map((name) => <th key={uniqueId()} scope="col">{name}</th>)}
        </tr>
      </thead>
      <tbody className="text-end">
        {weeks.map((days) => {
          const cells = days.map((value) => (
            <th key={uniqueId()} scope="col" className="fw-normal">
              {value}
            </th>
          ));
          const row = <tr key={uniqueId()} className="align-middle">{cells}</tr>;
          return row;
        })}
      </tbody>
    </table>
  );

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader role="heading">{t('header')}</PanelHeader>
        <Group>
          <Gradient style={{
            margin: '-7px -7px 0 -7px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 32,
          }}
          >
            <Header className="px-0 mb-2" mode="primary" multiline>
              {t('group.calendar.header', {
                daysCount: daysRangeCount,
                timezone: DateTime.now().zoneName,
                interpolation: { escapeValue: false },
              })}
            </Header>
            <Table />
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
