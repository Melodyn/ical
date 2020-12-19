#!/usr/bin/env node

import fastify from 'fastify';
import app from '../index.js';

const PORT = process.env.PORT || 5000;

fastify()
  .get('/', (req, res) => {
    const { name = 'VK' } = req.query;
    res.code(200).send(app(name));
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
