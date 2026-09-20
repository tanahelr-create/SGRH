-- Garantit en base qu'un personnel a au maximum UNE situation administrative
-- ouverte (date_fin IS NULL) : filet de sécurité derrière le verrouillage
-- applicatif. Additif et non destructif : aucune ligne n'est modifiée, seul un
-- index est ajouté ; vérifié au préalable qu'aucun doublon ouvert n'existe.
BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_situation_ouverte_par_personnel
  ON situations_administratives (personnel_id) WHERE date_fin IS NULL;

COMMIT;
