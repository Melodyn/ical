import React from 'react';
import {
  Group, Panel, PanelHeader, View,
} from '@vkontakte/vkui';
import uniqueId from 'lodash/uniqueId.js';
import { useTranslations } from '../../../hooks';

const HelpView = (props) => {
  const [translation] = useTranslations();
  const t = (name, options) => translation(`page.help.${name}`, options);
  const { id, activePanel, history } = props;
  const qaThemes = t('group', { returnObjects: true });

  const qaGroups = Object.entries(qaThemes).map(([groupName, { qa }]) => {
    const headerEl = (<h5>{t(`group.${groupName}.header`)}</h5>);
    const descriptionEl = <p>{t(`group.${groupName}.description`)}</p>;
    const qaEls = qa.map((_, i) => (
      <Group key={uniqueId()} mode="plain">
        <p className="fw-bold">{t(`group.${groupName}.qa.${i}.question`)}</p>
        <p>{t(`group.${groupName}.qa.${i}.answer`)}</p>
      </Group>
    ));

    return (
      <Group key={uniqueId()}>
        <div className="p-3">
          {headerEl}
          {descriptionEl}
          <Group className="ps-2" mode="plain">
            {qaEls}
          </Group>
        </div>
      </Group>
    );
  });

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader role="heading" shadow>{t('header')}</PanelHeader>
        <Group>
          <p className="px-3 pt-3">{t('description')}</p>
        </Group>
        {qaGroups}
      </Panel>
    </View>
  );
};

export default HelpView;
