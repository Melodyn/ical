import {
  Panel, PanelHeader, ScreenSpinner, View,
} from '@vkontakte/vkui';
import React from 'react';

const LoadingView = ({ userLng }) => (
  <View popout={<ScreenSpinner />} activePanel="loading">
    <Panel id="loading">
      <PanelHeader>{`${(userLng === 'ru') ? 'Загрузка' : 'Loading'}...`}</PanelHeader>
    </Panel>
  </View>
);

export default LoadingView;
