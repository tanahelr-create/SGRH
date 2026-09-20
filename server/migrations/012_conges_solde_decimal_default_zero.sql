-- Congés : correction du double comptage et prise en charge des demi-journées.
--
-- 1. solde_conges passe de integer à numeric(6,1) : le droit est de 2,5 jours par
--    mois de service effectif (Loi 2003-011 art. 64 ; Loi 2003-044 art. 86), donc
--    les soldes peuvent valoir 2,5 / 7,5 / 12,5... Conversion sans perte : chaque
--    valeur entière existante devient sa valeur décimale (30 -> 30.0, 60 -> 60.0).
-- 2. Le DEFAULT passe de 30 à 0 : les jours sont désormais attribués UNIQUEMENT par
--    la logique d'acquisition (congeDroitsService), plus par le DEFAULT SQL qui
--    s'ajoutait à la recharge annuelle (30 + 30 = 60).
--
-- Additif et non destructif : aucune ligne n'est modifiée (le DEFAULT ne s'applique
-- qu'aux futures insertions), aucune donnée n'est supprimée. Aucune vue ne dépend
-- de la colonne (vérifié).
--
-- Retour arrière (uniquement si aucun solde décimal n'a été enregistré depuis) :
--   ALTER TABLE personnel ALTER COLUMN solde_conges TYPE integer USING solde_conges::integer;
--   ALTER TABLE personnel ALTER COLUMN solde_conges SET DEFAULT 30;
BEGIN;

ALTER TABLE personnel
  ALTER COLUMN solde_conges TYPE numeric(6,1) USING solde_conges::numeric(6,1);

ALTER TABLE personnel
  ALTER COLUMN solde_conges SET DEFAULT 0;

COMMIT;
