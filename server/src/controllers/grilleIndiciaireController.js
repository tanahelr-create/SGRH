const grilleIndiciaireService = require('../services/grilleIndiciaireService');

async function listGrilles(req, res) {
  const grilles = await grilleIndiciaireService.listGrilles(req.query.regime);
  return res.status(200).json({ grilles });
}

async function getGrille(req, res) {
  try {
    const grille = await grilleIndiciaireService.getGrille(req.params.id);
    return res.status(200).json({ grille });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
}

async function rechercher(req, res) {
  const { regime, classe, echelon, cadre, echelle, categorie } = req.query;
  const lignes = await grilleIndiciaireService.rechercherLignes({
    regime, classe, cadre, echelle, categorie,
    echelon: echelon !== undefined ? Number(echelon) : undefined,
  });
  return res.status(200).json({ lignes });
}

async function resolve(req, res) {
  const { regime, cadre, echelle, categorie, corps, classe, echelon, dateEffet } = req.query;
  try {
    const resolution = await grilleIndiciaireService.resolveIndice({
      regime, cadre, echelle, categorie, corps, classe,
      echelon: echelon !== undefined ? Number(echelon) : undefined,
      dateEffet,
    });
    return res.status(200).json(resolution);
  } catch (err) {
    return res.status(422).json({ message: err.message });
  }
}

async function ajouterLigne(req, res) {
  try {
    const ligne = await grilleIndiciaireService.ajouterLigne({ ...req.body, grilleId: req.params.id });
    return res.status(201).json({ message: 'Ligne ajoutée', ligne });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { listGrilles, getGrille, rechercher, resolve, ajouterLigne };
