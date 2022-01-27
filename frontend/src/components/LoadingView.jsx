import {
  Panel, Group, PanelHeader, ScreenSpinner, View,
} from '@vkontakte/vkui';
import React from 'react';

const messages = {
  ru: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    loadingMessage: 'Медленно запрягаем, быстро едем',
    errorMessage: 'Приложению не удалось загрузиться. Попробуйте использовать другую версию (vk.com/m.vk.com/mobile app). Вы также можете написать разработчику: <a href="https://vk.me/join/qV74WOs_mSpeOSE9E8er089WI_uQsZdB9N8=" target="_blank">https://vk.me/join/qV74WOs_mSpeOSE9E8er089WI_uQsZdB9N8=</a>',
  },
  en: {
    loading: 'Loading...',
    error: 'Error',
    loadingMessage: 'Harness slowly, go fast',
    errorMessage: 'The application failed to load. Try to use another version (vk.com/m.vk.com/mobile app). You can also write to the developer: <a href="https://vk.me/join/qV74WOs_mSpeOSE9E8er089WI_uQsZdB9N8=" target="_blank">https://vk.me/join/qV74WOs_mSpeOSE9E8er089WI_uQsZdB9N8=</a>',
  },
};

const LoadingView = ({ userLng, state = 'loading' }) => (
  <View popout={state === 'loading' && <ScreenSpinner />} activePanel="loading">
    <Panel id="loading">
      <PanelHeader>{messages[userLng][state]}</PanelHeader>
      <Group>
        <p className="px-3 pt-3" dangerouslySetInnerHTML={{ __html: messages[userLng][`${state}Message`] }} />
      </Group>
    </Panel>
  </View>
);

export default LoadingView;
