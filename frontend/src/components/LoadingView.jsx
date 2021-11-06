import {
  Panel, PanelHeader, ScreenSpinner, View,
} from '@vkontakte/vkui';
import React from 'react';

export default ({ userLng }) => (
  <View popout={<ScreenSpinner />} activePanel="loading">
    <Panel id="loading">
      <PanelHeader>{`${(userLng === 'ru') ? 'Загрузка' : 'Loading'}...`}</PanelHeader>
    </Panel>
  </View>
);
