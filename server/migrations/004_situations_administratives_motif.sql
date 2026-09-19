-- Ajoute le motif du changement de situation administrative (checklist section 1).
-- Colonne nullable : ne casse pas les lignes existantes.
BEGIN;

ALTER TABLE situations_administratives ADD COLUMN IF NOT EXISTS motif TEXT;

COMMIT;
