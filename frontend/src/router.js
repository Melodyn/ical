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

export const views = generateEnum(['MAIN'], 'view');

export const panels = generateEnum(Object.keys(routes), 'panel');

export const pages = Object.entries(routes).reduce((acc, [name, route]) => {
  const panel = panels[name];
  acc[route] = new Page(panel, views.MAIN);
  return acc;
}, {});

export const router = new Router(pages);
