#!/usr/bin/env node

import express from 'express';
import app from '../index.js';

const PORT = process.env.PORT || 5000;

express()
  .get('/', (req, res) => {
    const { name = 'VK' } = req.query;
    res.send(app());
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
