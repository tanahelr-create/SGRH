-- Empêche deux contrats "actif" simultanés pour le même personnel (checklist section 15).
-- Additif et non destructif : aucune ligne existante n'est modifiée, seulement une
-- contrainte ajoutée ; vérifié au préalable qu'aucune donnée réelle ne la violait.
BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_contrats_actif_par_personnel
  ON contrats (personnel_id) WHERE statut = 'actif';

COMMIT;
