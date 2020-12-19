#!/usr/bin/env node

import express from 'express';
import bridge from '@vkontakte/vk-bridge';
import app from '../index.js';

const vkbridge = bridge.default;

vkbridge.send('VKWebAppInit', {})
  .then((data) => {
    console.log('VKWebAppInit', data);
    vkbridge.subscribe((e) => console.log('VKWebAppInit subscribe', e));
  })
  .catch(console.error);

const PORT = process.env.PORT || 5000;

express()
  .get('/', (req, res) => {
    console.log(req);
    res.send(app(req.query.vk_group_id));
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
