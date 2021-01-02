const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: 'bundle.js',
  },
};
