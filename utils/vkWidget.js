import axios from 'axios';

const token = '';

// набросок кода для последующего использования

const widget = {
  title: 'Заголовок',
  head: [{ text: 'Столбец 1', align: 'center' }, { text: 'Столбец 2' }],
  body: [[{ text: 'Значение 1.1' }, { text: 'Значение 1.2' }]],
};
const json = JSON.stringify(widget);

axios.get('https://api.vk.com/method/appWidgets.update', {
  params: {
    type: 'table',
    code: `return ${json};`,
    v: 5.126,
    access_token: token,
  },
})
  .then(console.log)
  .catch(console.error);
