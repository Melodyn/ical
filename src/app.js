import fastify from 'fastify';
import { configValidator } from '../utils/configValidator.js';

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);

  const server = fastify({
    logger: {
      prettyPrint: config.IS_DEV_ENV,
      level: config.LOG_LEVEL,
    },
  });

  server.get('/', (req, res) => {
    res.send(req.query.vk_group_id);
  });

  await server.listen(config.PORT, config.HOST);

  const stop = async () => {
    server.log.info('Stop app', config);
    await server.close();
    server.log.info('App stopped');

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
