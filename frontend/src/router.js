import { Router, Page } from '@happysanta/router';

const generateEnum = (names, prefix = '') => {
  const head = prefix === '' ? prefix : `${prefix}_`;
  return names.reduce((acc, name) => {
    acc[name] = `${head}${name.toLowerCase()}`;
    return acc;
  }, {});
};

export const routes = {
  MAIN: '/',
  KITTY: '/kitty',
  WORLD: '/world',
};
export const views = generateEnum(Object.keys(routes), 'view');
export const panels = generateEnum(Object.keys(routes), 'panel');
const viewsPages = Object.entries(routes).reduce((acc, [name, route]) => {
  const panel = panels[name];
  const view = views[name];
  acc[route] = new Page(panel, view);
  return acc;
}, {});
// const panelsPages = Object.entries(routes).reduce((acc, [name, route]) => {
//   const panel = panels[name];
//   acc[route] = new Page(panel, views.MAIN);
//   return acc;
// }, {});

const viewsRouter = new Router(viewsPages);
// viewsRouter.start();
// const panelsRouter = new Router(panelsPages);
// panelsRouter.start();
const epicRouter = viewsRouter;
epicRouter.start();

export { epicRouter as router };
