-- Congés : suivi par année (état de congé), imputation des jours pris et
-- photographie du solde à la date de la demande (fiche imprimable).
--
-- Additif et non destructif : deux nouvelles tables et deux colonnes nullables.
-- Aucune ligne existante n'est modifiée ; les congés déjà enregistrés gardent
-- solde_avant / solde_apres à NULL et aucune imputation. Les soldes historiques
-- (sans ligne de droit annuel) apparaissent comme « solde d'ouverture non
-- ventilé » : conges_imputations.annee NULL.
--
-- Cohérence : personnel.solde_conges reste le solde courant ; il n'est modifié que
-- par les transactions qui écrivent aussi ces tables (recharge, débit, refus).
-- Retour arrière : DROP TABLE conges_imputations, conges_droits_annuels ;
--                  ALTER TABLE conges DROP COLUMN solde_avant, DROP COLUMN solde_apres;
BEGIN;

CREATE TABLE IF NOT EXISTS conges_droits_annuels (
  id              SERIAL PRIMARY KEY,
  personnel_id    INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  annee           INTEGER NOT NULL CHECK (annee BETWEEN 1950 AND 2200),
  libelle_periode VARCHAR(20),
  droit           NUMERIC(6,1) NOT NULL CHECK (droit >= 0),
  source          VARCHAR(12) NOT NULL DEFAULT 'CALCULE' CHECK (source IN ('CALCULE', 'OUVERTURE')),
  reference       VARCHAR(255),
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT uniq_droit_annuel_par_personnel UNIQUE (personnel_id, annee)
);

CREATE TABLE IF NOT EXISTS conges_imputations (
  id       SERIAL PRIMARY KEY,
  conge_id INTEGER NOT NULL REFERENCES conges(id) ON DELETE CASCADE,
  annee    INTEGER,
  jours    NUMERIC(6,1) NOT NULL CHECK (jours > 0)
);
CREATE INDEX IF NOT EXISTS idx_conges_imputations_conge ON conges_imputations (conge_id);
CREATE INDEX IF NOT EXISTS idx_conges_imputations_annee ON conges_imputations (annee);

ALTER TABLE conges
  ADD COLUMN IF NOT EXISTS solde_avant NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS solde_apres NUMERIC(6,1);

COMMIT;
