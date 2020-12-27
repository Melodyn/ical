import express from 'express';
import { configValidator } from '../utils/configValidator.js';

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);

  const server = express();
  server.get('/', (req, res) => {
    res.send(req.query.vk_group_id);
  });

  const runningServer = server.listen(config.PORT, config.HOST, () => {
    if (!config.IS_TEST_ENV) {
      console.log(`Server running on http://${config.HOST}:${config.PORT}`);
    }
  });

  const stop = async () => {
    console.log('Stop app', config);
    runningServer.close((err) => {
      if (!config.IS_TEST_ENV) {
        if (err) console.error(err);
        console.log('Server stopped');
      }
    });
    console.log('App stopped');

    if (!config.IS_TEST_ENV) {
      process.exit(0);
    }
  };

  process.on('SIGTERM', stop);

  return {
    server,
    stop,
  };
};

export default app;
