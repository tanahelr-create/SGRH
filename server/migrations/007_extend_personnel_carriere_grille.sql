-- Rattache personnel/carriere_evenements aux grilles indiciaires, sans toucher
-- aux colonnes texte existantes (corps/classe/echelon/indice restent, en legacy,
-- tant qu'un événement n'a pas été résolu via la grille). Additif uniquement.
BEGIN;

ALTER TABLE personnel
    ADD COLUMN IF NOT EXISTS cadre VARCHAR(5),
    ADD COLUMN IF NOT EXISTS echelle VARCHAR(5),
    ADD COLUMN IF NOT EXISTS indice_num INTEGER,
    ADD COLUMN IF NOT EXISTS ligne_grille_actuelle_id INTEGER REFERENCES lignes_grille_indiciaire(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS indice_source VARCHAR(20) NOT NULL DEFAULT 'A_CONFIRMER';

ALTER TABLE personnel
    DROP CONSTRAINT IF EXISTS personnel_cadre_check,
    ADD CONSTRAINT personnel_cadre_check CHECK (cadre IS NULL OR cadre IN ('A', 'B', 'C', 'D'));
ALTER TABLE personnel
    DROP CONSTRAINT IF EXISTS personnel_indice_source_check,
    ADD CONSTRAINT personnel_indice_source_check CHECK (indice_source IN ('IMPORT_EXCEL', 'SAISIE_RH', 'REGLEMENTAIRE', 'A_CONFIRMER'));

ALTER TABLE carriere_evenements
    ADD COLUMN IF NOT EXISTS ligne_grille_id INTEGER REFERENCES lignes_grille_indiciaire(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS indice_num INTEGER,
    ADD COLUMN IF NOT EXISTS indice_source VARCHAR(20) NOT NULL DEFAULT 'A_CONFIRMER';

ALTER TABLE carriere_evenements
    DROP CONSTRAINT IF EXISTS carriere_evenements_indice_source_check,
    ADD CONSTRAINT carriere_evenements_indice_source_check CHECK (indice_source IN ('IMPORT_EXCEL', 'SAISIE_RH', 'REGLEMENTAIRE', 'A_CONFIRMER'));

-- Backfill non destructif : récupère les valeurs déjà numériques présentes dans les
-- colonnes texte existantes (ex. "950" -> 950). Les valeurs non numériques (ex. vides,
-- "à définir") restent NULL, jamais transformées en 0 ni en une valeur devinée.
UPDATE personnel
SET indice_num = NULLIF(regexp_replace(indice, '[^0-9]', '', 'g'), '')::INTEGER
WHERE indice IS NOT NULL AND indice_num IS NULL;

UPDATE carriere_evenements
SET indice_num = NULLIF(regexp_replace(indice, '[^0-9]', '', 'g'), '')::INTEGER
WHERE indice IS NOT NULL AND indice_num IS NULL;

COMMIT;
