import React, { useState } from 'react';
import {
  Group, Panel, PanelHeader, Header, View, Div,
  FormLayout, FormItem, Input, Button, Select,
} from '@vkontakte/vkui';
import { useTranslations, useScheme } from '../../../hooks';
import SettingsButton from '../Custom/SettingsButton.jsx';

const SettingsView = (props) => {
  const [tr, i18n] = useTranslations();
  const t = (name, params) => tr(`page.settings.${name}`, params);
  const [scheme, changeScheme] = useScheme();
  const { id, activePanel, history } = props;
  const nextLng = t(`group.app.invertedLanguage.${i18n.language}`);
  const nextScheme = t(`group.app.invertedScheme.${scheme}`);
  const changeLanguage = () => i18n.changeLanguage(nextLng);

  const tf = (name, params) => t(`group.calendar.form.${name}`, params);
  const [formIsValid, setFormIsValid] = useState(false);
  const [calendarId, setCalendarId] = useState('');
  const [timezone, setTimezone] = useState('');
  // eslint-disable-next-line no-alert
  const onClick = () => alert(`${calendarId} ${timezone}`);
  const onChangeInput = (e) => setCalendarId(e.target.value);
  const onChangeSelect = (e) => setTimezone(e.target.value);
  const fieldsIsValid = calendarId.length > 0 && timezone.length > 0;
  if (!formIsValid && fieldsIsValid) {
    setFormIsValid(true);
  }
  if (formIsValid && !fieldsIsValid) {
    setFormIsValid(false);
  }

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader>{t('header')}</PanelHeader>
        <Group>
          <Div>
            <Header className="ps-0">{t('group.calendar.header')}</Header>
          </Div>
          <FormLayout>
            <FormItem
              top={tf('calendarIdField')}
              bottom={!calendarId ? tf('calendarIdError') : ''}
              status={calendarId ? 'valid' : 'error'}
            >
              <Input
                id="calendarId"
                name="calendarId"
                type="email"
                onChange={onChangeInput}
                value={calendarId}
                required
              />
            </FormItem>
            <FormItem
              top={tf('timezoneField')}
              bottom={!timezone ? tf('timezoneError') : ''}
              status={timezone ? 'valid' : 'error'}
            >
              <Select
                id="timezone"
                name="timezone"
                required
                placeholder={tf('timezonePlaceholder')}
                onChange={onChangeSelect}
                value={timezone}
                options={Array.from(Array(10).keys()).map((value) => ({
                  value: (value + 1).toString().padStart(2, '0'),
                  label: `# ${(value + 1).toString().padStart(2, '0')}`,
                }))}
              />
            </FormItem>
            <FormItem>
              <Button size="l" onClick={onClick} disabled={!formIsValid}>Нажать</Button>
            </FormItem>
          </FormLayout>
        </Group>
        <Group>
          <Div>
            <Header className="ps-0">{t('group.app.header')}</Header>
            <SettingsButton
              description={t('group.app.changeScheme', { scheme: nextScheme })}
              buttonText={t('group.app.button.changeScheme')}
              onClick={changeScheme}
            />
            <SettingsButton
              description={t('group.app.changeLanguage', { lng: nextLng })}
              buttonText={t('group.app.button.changeLanguage')}
              onClick={changeLanguage}
            />
          </Div>
        </Group>
      </Panel>
    </View>
  );
};

export default SettingsView;
