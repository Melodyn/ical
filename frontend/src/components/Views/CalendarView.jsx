import React from 'react';
import {
  Group, Panel, PanelHeader, Header, View,
} from '@vkontakte/vkui';
import { DateTime } from 'luxon';
import uniqueId from 'lodash/uniqueId.js';
import { useTranslations } from '../../../hooks';
import rangeDates from '../../../libs/rangeDates.js';

const CalendarView = (props) => {
  const [t] = useTranslations();
  const { id, activePanel, history } = props;
  const daysRangeCount = 30;
  const datesRange = rangeDates(daysRangeCount);
  const nowWeekday = DateTime.now().weekday;
  const weeks = [];

  let weekDayCounter = 1;
  let weekCounter = 1;
  let rangeCounter = 0;
  let isLastDayOfWeek = false;
  let rangeIsCompleted = false;

  do {
    const weekIndex = weekCounter - 1;
    if (!weeks[weekIndex]) weeks.push([]);
    const week = weeks[weekIndex];

    if (weekDayCounter >= nowWeekday) {
      const value = rangeCounter >= daysRangeCount ? '' : datesRange[rangeCounter].day;
      week.push(value);
      rangeCounter += 1;
    } else {
      week.push('');
    }

    weekDayCounter += 1;
    const weekdayIndex = weekDayCounter - 1;
    isLastDayOfWeek = (weekdayIndex > 0) && (weekdayIndex % 7 === 0);
    if (isLastDayOfWeek) {
      weekCounter += 1;
    }

    rangeIsCompleted = rangeCounter >= daysRangeCount;
  } while (!(rangeIsCompleted && isLastDayOfWeek));

  const Table = () => (
    <table className="table table-bordered user-select-none" id="calendar">
      <thead className="table-dark text-center">
        <tr className="align-middle">
          <th scope="col">пн</th>
          <th scope="col">вт</th>
          <th scope="col">ср</th>
          <th scope="col">чт</th>
          <th scope="col">пт</th>
          <th scope="col">сб</th>
          <th scope="col">вс</th>
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
        <PanelHeader role="heading">{t('page.calendar.title')}</PanelHeader>
        <Group>
          <Header mode="primary">Кто может писать мне личные сообщения</Header>
          <Table />
        </Group>
      </Panel>
    </View>
  );
};

export default CalendarView;
