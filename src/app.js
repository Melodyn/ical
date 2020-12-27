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

  const runningServer = server.listen(config.PORT, config.HOST);

  const stop = async () => {
    console.log('Stop app', config);
    runningServer.close();
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
