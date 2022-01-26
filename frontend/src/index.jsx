import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../public/index.css';
import '@vkontakte/vkui/dist/vkui.css';
import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep.js';
import getVkBridge from '../libs/getVkBridge.js';
import generateConfig from '../libs/generateConfig.js';
import App from './App.jsx';

const vkParams = Object.fromEntries((new URL(window.location.href)).searchParams);
const env = process.env.NODE_ENV || 'production';
const config = generateConfig(env, vkParams);
// eslint-disable-next-line no-undef
getConfig = () => cloneDeep(config);

const bridge = getVkBridge(config);

bridge.send('VKWebAppInit');

ReactDOM.render(<App config={config} bridge={bridge} />, document.getElementById('root'));
