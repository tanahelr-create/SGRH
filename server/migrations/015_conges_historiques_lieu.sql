-- Lieu de jouissance des congés historiques (d'avant le SGRH) : nécessaire à la
-- décision d'octroi (« pour en jouir à : … ») établie a posteriori pour un congé déjà pris.
-- Additif : une colonne nullable, aucune ligne modifiée.
-- Retour arrière : ALTER TABLE conges_historiques DROP COLUMN lieu_jouissance;
BEGIN;

ALTER TABLE conges_historiques ADD COLUMN IF NOT EXISTS lieu_jouissance VARCHAR(150);

COMMIT;
