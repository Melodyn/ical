import React from 'react';
import {
  Epic, Tabbar, TabbarItem,
} from '@vkontakte/vkui';
import {
  Icon24CalendarOutline,
  Icon24ServicesOutline,
  Icon28SettingsOutline,
  Icon24HelpOutline, Icon16ChevronLeft,
} from '@vkontakte/icons';
import { useLocation } from '@happysanta/router';
import { views, router, routes } from '../../libs/router.js';
import { useTranslations } from '../../hooks';

const Navigation = ({ children }) => {
  const location = useLocation();
  const [t] = useTranslations();
  const activeViewId = location.getViewId();

  const onClick = (e) => router.pushPage(e.currentTarget.dataset.story);
  const onBack = () => router.popPage();

  return (
    <Epic
      activeStory={activeViewId}
      tabbar={(
        <Tabbar
          role="navigation"
        >
          <TabbarItem
            onClick={onClick}
            selected={activeViewId === views.INSTALL}
            data-story={routes.INSTALL}
            text={t('nav.install')}
            role="button"
          >
            <Icon24ServicesOutline width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={activeViewId === views.HELP}
            data-story={routes.HELP}
            text={t('nav.help')}
            role="button"
          >
            <Icon24HelpOutline width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={activeViewId === views.CALENDAR}
            data-story={routes.CALENDAR}
            text={t('nav.calendar')}
            role="button"
          >
            <Icon24CalendarOutline width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={activeViewId === views.SETTINGS}
            data-story={routes.SETTINGS}
            text={t('nav.settings')}
            role="button"
          >
            <Icon28SettingsOutline width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onBack}
            text={t('nav.back')}
            role="button"
          >
            <Icon16ChevronLeft width={24} height={24} />
          </TabbarItem>
        </Tabbar>
      )}
    >
      {children}
    </Epic>
  );
};

export default Navigation;
