/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useLocation } from '@happysanta/router';
import { views } from '../../libs/router.js';
import Navigation from './Navigation.jsx';
import InstallView from './Views/InstallView.jsx';
import CalendarView from './Views/CalendarView.jsx';
import SettingsView from './Views/SettingsView.jsx';
import HelpView from './Views/HelpView.jsx';

const Main = () => {
  const location = useLocation();
  const generateProps = (view) => ({
    id: view,
    activePanel: location.getViewActivePanel(view),
    history: location.hasOverlay() ? [] : location.getViewHistory(view),
  });

  return (
    <Navigation>
      <CalendarView {...generateProps(views.CALENDAR)} />
      <InstallView {...generateProps(views.INSTALL)} />
      <SettingsView {...generateProps(views.SETTINGS)} />
      <HelpView {...generateProps(views.HELP)} />
    </Navigation>
  );
};

export default Main;
