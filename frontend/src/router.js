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

// export const pages = {
//   [routes.MAIN]: new Page(panels.MAIN, views.MAIN),
//   [routes.KITTY]: new Page(panels.KITTY, views.KITTY),
//   [routes.WORLD]: new Page(panels.WORLD, views.WORLD),
// };

export const pages = Object.entries(routes).reduce((acc, [name, route]) => {
  const panel = panels[name];
  const view = views[name];
  acc[route] = new Page(panel, view);
  return acc;
}, {});

export const router = new Router(pages);

router.start();
