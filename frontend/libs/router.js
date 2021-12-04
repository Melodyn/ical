import { Router, Page } from '@happysanta/router';

const generateEnum = (names, prefix = '') => {
  const head = prefix === '' ? prefix : `${prefix}_`;
  return names.reduce((acc, name) => {
    acc[name] = `${head}${name.toLowerCase()}`;
    return acc;
  }, {});
};

export const routes = {
  INSTALL: '/install',
  CALENDAR: '/calendar',
  SETTINGS: '/settings',
  HELP: '/help',
};
export const views = generateEnum(Object.keys(routes), 'view');
export const panels = generateEnum(Object.keys(routes), 'panel');
const viewsPages = Object.entries(routes).reduce((acc, [name, route]) => {
  const panel = panels[name];
  const view = views[name];
  acc[route] = new Page(panel, view);
  return acc;
}, {});

const router = new Router(viewsPages, {
  defaultPage: routes.CALENDAR,
  defaultView: views.CALENDAR,
  defaultPanel: panels.CALENDAR,
});
router.start();

export { router };
