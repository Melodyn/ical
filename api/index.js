export default (req, res) => {
  try {
    const { name = 'World' } = req.query;
    res.status(200).send(`Hello ${name}!`);
  } catch (e) {
    console.log(e.message);
  }
};
