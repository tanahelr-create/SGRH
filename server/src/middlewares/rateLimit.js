// Limitation de débit en mémoire (par adresse IP), sans dépendance externe.
// Destinée aux routes publiques (sans authentification) pour empêcher les essais
// répétés. Le compteur est propre à ce processus : suffisant pour une instance unique.
function creerLimiteur({ fenetreMs, max, message = 'Trop de requêtes. Veuillez réessayer plus tard.' }) {
  const compteurs = new Map();

  return function limiteur(req, res, next) {
    const maintenant = Date.now();

    // Purge paresseuse des entrées expirées pour borner la mémoire.
    if (compteurs.size > 1000) {
      for (const [cle, e] of compteurs) if (e.finFenetre <= maintenant) compteurs.delete(cle);
    }

    const cle = req.ip || 'inconnu';
    let entree = compteurs.get(cle);
    if (!entree || entree.finFenetre <= maintenant) {
      entree = { compte: 0, finFenetre: maintenant + fenetreMs };
      compteurs.set(cle, entree);
    }
    entree.compte += 1;

    if (entree.compte > max) {
      res.set('Retry-After', String(Math.ceil((entree.finFenetre - maintenant) / 1000)));
      return res.status(429).json({ message });
    }
    return next();
  };
}

module.exports = { creerLimiteur };
