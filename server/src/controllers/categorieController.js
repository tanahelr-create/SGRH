const categorieRepository = require('../repositories/categorieRepository');

async function list(req, res) {
  const categories = await categorieRepository.listAll();
  return res.status(200).json({ categories });
}

module.exports = { list };