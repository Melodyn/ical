import React from 'react';
import ReactDOM from 'react-dom';
import '@vkontakte/vkui/dist/vkui.css';
import bridge from '@vkontakte/vk-bridge';
import paramsParser from '../libs/vk.js';
import App from './App.jsx';

bridge.send('VKWebAppInit');
const vkParams = paramsParser(new URL(window.location.href));
const NODE_ENV = process.env.NODE_ENV || 'production';
const config = {
  NODE_ENV,
  IS_PROD_ENV: NODE_ENV === 'production',
  IS_DEV_ENV: NODE_ENV === 'development',
  IS_TEST_ENV: NODE_ENV === 'test',
  ROLLBAR_TOKEN: '3fc738e63c1e4cd19b5b2584d06e2391',
  VK_PARAMS: vkParams,
};

ReactDOM.render(<App config={config} />, document.getElementById('root'));
