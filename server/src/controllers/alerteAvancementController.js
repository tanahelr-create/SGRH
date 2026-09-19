const avancementService = require('../services/avancementService');

async function list(req, res) {
  const personnelId = req.query.personnel ? Number(req.query.personnel) : undefined;
  const alertes = await avancementService.listerAlertesOuvertes(personnelId);
  return res.status(200).json({ alertes });
}

async function traiterEchelon(req, res) {
  const { categorie, cadre, echelle, dateEffet, referenceDecision, autoriteDecision } = req.body;
  if (!dateEffet) return res.status(400).json({ message: 'dateEffet est requis' });

  try {
    const evenement = await avancementService.traiterAvancementEchelon(
      req.params.id, { categorie, cadre, echelle, dateEffet, referenceDecision, autoriteDecision }, req.user.id
    );
    return res.status(200).json({ message: 'Avancement d\'échelon enregistré', evenement });
  } catch (err) {
    return res.status(422).json({ message: err.message });
  }
}

async function ignorer(req, res) {
  try {
    const alerte = await avancementService.ignorerAlerte(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Alerte ignorée', alerte });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { list, traiterEchelon, ignorer };
