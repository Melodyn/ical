import React from 'react';
import ReactDOM from 'react-dom';
import '@vkontakte/vkui/dist/vkui.css';
import bridge from '@vkontakte/vk-bridge';
import paramsParser from '../libs/vk.js';
import generateConfig from '../libs/generateConfig.js';
import App, { appearanceCtx } from './App.jsx';

let appearance = 'light';

bridge.send('VKWebAppInit');
bridge.subscribe((event) => {
  if (!event.detail) return;

  const { type, data } = event.detail;

  switch (type) {
    case 'VKWebAppUpdateConfig': {
      console.log('VKWebAppUpdateConfig', data);
      appearance = data.appearance;
      break;
    }
    default:
      break;
  }
});

const vkParams = paramsParser(new URL(window.location.href));
const env = process.env.NODE_ENV || 'production';
const config = generateConfig(env, vkParams);

ReactDOM.render(<appearanceCtx.Provider value={appearance}><App config={config} /></appearanceCtx.Provider>, document.getElementById('root'));
