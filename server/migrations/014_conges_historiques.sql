-- Congés pris AVANT la mise en service du SGRH (états de congé officiels) :
-- nécessaires à l'état de congé (dates de début et de fin, jours pris par année de
-- droit) pour les agents dont l'historique n'existe pas dans la table conges.
-- Table séparée de conges : un agent sans compte utilisateur peut avoir un état de
-- congé (conges.user_id est obligatoire, ces lignes n'y ont donc pas leur place).
--
-- Additif et non destructif : nouvelle table, aucune ligne existante modifiée.
-- Retour arrière : DROP TABLE conges_historiques;
BEGIN;

CREATE TABLE IF NOT EXISTS conges_historiques (
  id           SERIAL PRIMARY KEY,
  personnel_id INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  annee        INTEGER NOT NULL CHECK (annee BETWEEN 1950 AND 2200),
  date_debut   DATE NOT NULL,
  date_fin     DATE NOT NULL,
  jours        NUMERIC(6,1) NOT NULL CHECK (jours > 0),
  reference    VARCHAR(255),
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT conges_historiques_dates_check CHECK (date_fin >= date_debut)
);
CREATE INDEX IF NOT EXISTS idx_conges_historiques_personnel ON conges_historiques (personnel_id, annee);

COMMIT;
