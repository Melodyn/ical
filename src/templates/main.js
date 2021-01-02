import header from './header.js';

const renderMain = (appId) => {
  const appLink = `https://vk.com/add_community_app.php?aid=${appId}`;
  const html = [
    '<center>',
    '<h3>Приложению требуется установка</h3>',
    '<p>Добавьте приложение в сообщество по ссылке:<br/>',
    `<a href="${appLink}" target="_blank">${appLink}</a>`,
    '</p>',
    '</center>',
  ];

  return [header, ...html].join('\n');
};

export default renderMain;
