-- Checklist section 5 : lien de navigation sur une notification (clic depuis la
-- cloche -> élément concerné), et suivi de la notification "contrat expiré"
-- (distincte de l'alerte d'échéance à 183 jours). Colonnes nullables, additives.
BEGIN;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS lien VARCHAR(255);
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS notifie_expiration_le TIMESTAMP;

COMMIT;
