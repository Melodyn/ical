import React from 'react';
import {
  Epic, Tabbar, TabbarItem,
  Group, Panel, PanelHeader, SimpleCell, View,
  ConfigProviderContext, ScreenSpinner,
} from '@vkontakte/vkui';
import {
  Icon16ArrowTriangleDown,
  Icon16ArrowTriangleUp,
  Icon16Play,
  Icon16ChevronLeft,
  Icon24Palette,
  Icon20HieroglyphCharacterOutline,
} from '@vkontakte/icons';
import { useLocation } from '@happysanta/router';
import {
  views, panels, router, routes,
} from './router.js';
import { useTranslations } from '../resources';

const Main = ({ appIsLoaded = false, userLng }) => {
  if (!appIsLoaded) {
    const loadMsg = (userLng === 'ru') ? 'Загрузка' : 'Loading';
    return (
      <View popout={<ScreenSpinner />} activePanel="loading">
        <Panel id="loading">
          <PanelHeader>{`${loadMsg}...`}</PanelHeader>
        </Panel>
      </View>
    );
  }

  const location = useLocation();
  const [t, i18n] = useTranslations();
  const viewId = location.getViewId();

  const onClick = (e) => router.pushPage(e.currentTarget.dataset.story);
  const onBack = () => router.popPage();

  return (
    <Epic
      activeStory={viewId}
      tabbar={(
        <Tabbar
          role="navigation"
        >
          <TabbarItem
            onClick={onClick}
            selected={viewId === views.MAIN}
            data-story={routes.MAIN}
            text={t('nav.home')}
            role="button"
          >
            <Icon16Play width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={viewId === views.KITTY}
            data-story={routes.KITTY}
            text={t('nav.kitty')}
            role="button"
          >
            <Icon16ArrowTriangleUp width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={viewId === views.WORLD}
            data-story={routes.WORLD}
            text={t('nav.world')}
            role="button"
          >
            <Icon16ArrowTriangleDown width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onBack}
            text={t('nav.back')}
            role="button"
          >
            <Icon16ChevronLeft width={24} height={24} />
          </TabbarItem>
          <ConfigProviderContext.Consumer>
            {(ctx) => (
              <TabbarItem
                onClick={ctx.changeScheme}
                text={t('settings.theme')}
                role="button"
              >
                <Icon24Palette />
              </TabbarItem>
            )}
          </ConfigProviderContext.Consumer>
          <TabbarItem
            onClick={() => {
              const lng = i18n.language === 'en' ? 'ru' : 'en';
              return i18n.changeLanguage(lng);
            }}
            text={t('settings.lang')}
            role="button"
          >
            <Icon20HieroglyphCharacterOutline width={24} height={24} />
          </TabbarItem>
        </Tabbar>
    )}
    >
      <View
        id={views.MAIN}
        activePanel={location.getViewActivePanel(views.MAIN)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.MAIN}>
          <PanelHeader>Main</PanelHeader>
          <Group>
            <SimpleCell>Kitty</SimpleCell>
            <SimpleCell>World</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View
        id={views.KITTY}
        activePanel={location.getViewActivePanel(views.KITTY)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.KITTY}>
          <PanelHeader>Hello Kitty</PanelHeader>
          <Group>
            <SimpleCell />
            <SimpleCell>H</SimpleCell>
            <SimpleCell>e</SimpleCell>
            <SimpleCell>l</SimpleCell>
            <SimpleCell>l</SimpleCell>
            <SimpleCell>o</SimpleCell>
            <SimpleCell />
            <SimpleCell />
            <SimpleCell>K</SimpleCell>
            <SimpleCell>i</SimpleCell>
            <SimpleCell>t</SimpleCell>
            <SimpleCell>t</SimpleCell>
            <SimpleCell>y</SimpleCell>
            <SimpleCell />
            <SimpleCell />
          </Group>
        </Panel>
      </View>
      <View
        id={views.WORLD}
        activePanel={location.getViewActivePanel(views.WORLD)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.WORLD}>
          <PanelHeader>Hello World</PanelHeader>
          <Group>
            <SimpleCell>{'World '.repeat(10)}</SimpleCell>
          </Group>
        </Panel>
      </View>
    </Epic>
  );
};

export default Main;
