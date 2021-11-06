import React from 'react';
import { views } from '../../libs/router.js';
import Navigation from './Navigation.jsx';
import InstallView from './Views/InstallView.jsx';
import CalendarView from './Views/CalendarView.jsx';
import SettingsView from './Views/SettingsView.jsx';
import HelpView from './Views/HelpView.jsx';

const Main = () => (
  <Navigation>
    <InstallView id={views.INSTALL} />
    <CalendarView id={views.CALENDAR} />
    <SettingsView id={views.SETTINGS} />
    <HelpView id={views.HELP} />
  </Navigation>
);

export default Main;
