import React from 'react';
import {
  Group, Panel, PanelHeader, Button, View,
} from '@vkontakte/vkui';
import { useTranslations } from '../../../hooks';

const InstallView = (props) => {
  const [t] = useTranslations();
  const { id, activePanel, history } = props;

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader role="heading">{t('page.install.header')}</PanelHeader>
        <Group>
          <div className="p-3">
            <Group mode="plain">
              <h3 className="text-center">{t('page.install.appName')}</h3>
              <p className="text-start">{t('page.install.description')}</p>
            </Group>
            <Group className="text-center py-5" mode="plain">
              <p>{t('page.install.group.select.description')}</p>
              <Button mode="primary" size="l">
                {t('page.install.group.select.button')}
              </Button>
            </Group>
          </div>
        </Group>
      </Panel>
    </View>
  );
};

export default InstallView;
