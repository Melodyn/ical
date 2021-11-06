import React from 'react';
import ReactDOM from 'react-dom';
import '@vkontakte/vkui/dist/vkui.css';
import getVkBridge from '../libs/getVkBridge.js';
import paramsParser from '../libs/vk.js';
import generateConfig from '../libs/generateConfig.js';
import App from './App.jsx';

const vkParams = paramsParser(new URL(window.location.href));
const env = process.env.NODE_ENV || 'production';
const config = generateConfig(env, vkParams);
// eslint-disable-next-line no-undef
getConfig = () => config;

const bridge = getVkBridge(config);

bridge.send('VKWebAppInit');

ReactDOM.render(<App config={config} bridge={bridge} />, document.getElementById('root'));
