#!/usr/bin/env node

import app from '../index.js';

app(process.env.NODE_ENV)
  .then((err) => {
    console.error(err);
    process.exit(1);
  });
