import { setupServer } from 'msw/node';
import { rest } from 'msw';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlblNldHRpbmdzIjoiIiwiYXBwSWQiOjc5NjY0MDMsImFyZU5vdGlmaWNhdGlvbnNFbmFibGVkIjowLCJncm91cElkIjoxMDEyOTU5NTMsImlzQXBwVXNlciI6MSwiaXNGYXZvcml0ZSI6MCwibGFuZ3VhZ2UiOiJydSIsInBsYXRmb3JtIjoiZGVza3RvcF93ZWIiLCJyZWYiOiJvdGhlciIsInRzIjoxMDAwMDAwMDAwLCJ1c2VySWQiOjAsInZpZXdlckdyb3VwUm9sZSI6ImFkbWluIiwic2lnbiI6IkJfMDdRZVVibXVQUnpySm5GNV9zRWhfNk8teDZNNU5ZbVI0NzFadHB2NEUiLCJpc0FkbWluIjp0cnVlLCJpc0FwcEFkbWluIjp0cnVlLCJpYXQiOjE2NDE3MjAxOTgsImV4cCI6MTY0MTgwNjU5OH0.UgLS6l2lOzLzboO7iVIdmryxruA2xC_AkgyfcNtVnV0';
const worker = setupServer(
  rest.post('/auth', (req, res, ctx) => {
    if (!req.body.sign) {
      return res(
        ctx.status(401),
        ctx.json({
          message: 'lol',
          name: 'kek',
          params: req.body,
        }),
      );
    }

    return res(ctx.json({
      token,
    }));
  }),
);

export default worker;
