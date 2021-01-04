const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  output: {
    path: path.resolve(__dirname, 'src', 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
