import fastify from 'fastify';
import app from './index.js';

fastify()
  .get('/', (req, res) => {
    const { name } = req.query;
    res.code(200).send(app(name));
  })
  .listen(8080, () => {
    console.log('Server running on http://localhost:8080');
  });
