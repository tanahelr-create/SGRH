-- Remplace le type d'événement « Changement de service ou d'établissement » par
-- « Changement de service » dans la contrainte CHECK de carriere_evenements.
-- Aucune donnée n'est modifiée ni supprimée : seule la contrainte est remplacée
-- (mêmes valeurs, dans le même ordre, hormis celle-ci). Garde-fou : la migration
-- s'interrompt si une ligne existante utilise encore l'ancienne valeur.
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM carriere_evenements WHERE type_evenement = 'Changement de service ou d''établissement') THEN
    RAISE EXCEPTION 'Des événements utilisent encore l''ancien type : migrer ces lignes avant d''appliquer 011';
  END IF;
END $$;

ALTER TABLE carriere_evenements DROP CONSTRAINT IF EXISTS carriere_evenements_type_evenement_check;

ALTER TABLE carriere_evenements ADD CONSTRAINT carriere_evenements_type_evenement_check
  CHECK (type_evenement::text = ANY (ARRAY[
    'Recrutement', 'Stage', 'Titularisation', 'Prolongation de stage',
    'Avancement d''échelon', 'Avancement de grade', 'Reclassement',
    'Changement de fonction', 'Changement d''affectation', 'Changement de service',
    'Mise à disposition', 'Détachement', 'Disponibilité', 'Formation ou diplôme',
    'Changement de qualification', 'Avenant au contrat', 'Renouvellement de contrat',
    'Suspension ou événement disciplinaire', 'Retraite', 'Fin de contrat',
    'Cessation définitive de fonctions', 'Réintégration', 'Autre'
  ]::text[]));

COMMIT;
