#!/usr/bin/env node

import express from 'express';
import bridge from '@vkontakte/vk-bridge';
import app from '../index.js';

const vkbridge = bridge.default;

const PORT = process.env.PORT || 5000;

vkbridge.send('VKWebAppInit', {})
  .then(() => {
    vkbridge.subscribe((e) => console.log(e));
  })
  .catch(console.error);

express()
  .get('/', (req, res) => {
    console.log(req);
    res.send(app());
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
