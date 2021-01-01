const routes = [
  {
    method: 'GET',
    url: '/calendar',
    async handler(req, res) {
      const clubRepository = this.db.getRepository('Calendar');
      const clubs = await clubRepository.find();
      res.send(JSON.stringify(clubs));
    },
  },
  {
    method: 'POST',
    url: '/calendar',
    async handler(req, res) {
      const clubRepository = this.db.getRepository('Calendar');
      await clubRepository.save({
        clubId: req.query.vk_group_id,
        calendarId: req.body.calendarId,
      });
      res.send('ok');
    },
  },
  {
    method: 'GET',
    url: '/',
    handler: (req, res) => {
      res.send(`vk_group_id is ${req.query.vk_group_id}`);
    },
  },
];

export default routes;
