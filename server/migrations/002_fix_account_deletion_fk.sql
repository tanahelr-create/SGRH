-- Donne un comportement ON DELETE explicite à toutes les FK vers users(id),
-- pour que la suppression d'un compte ne casse plus sur une contrainte non gérée.
-- SET NULL = colonnes "auteur de l'action" (nullable) : la ligne d'origine (carrière,
--   diplôme, situation administrative, document généré...) reste intacte.
-- CASCADE = colonnes NOT NULL qui définissent le propriétaire de la ligne
--   (congés, historique de fonction, notifications reçues, jetons de reset) :
--   le code applicatif sauvegarde ces lignes dans la corbeille avant suppression,
--   sauf les jetons de reset qui n'ont aucune valeur de restauration.
-- Ré-exécutable sans risque (DROP CONSTRAINT IF EXISTS avant chaque ADD).

BEGIN;

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_user_id_fkey;
ALTER TABLE activity_log ADD CONSTRAINT activity_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE carriere_evenements DROP CONSTRAINT IF EXISTS carriere_evenements_created_by_fkey;
ALTER TABLE carriere_evenements ADD CONSTRAINT carriere_evenements_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE carriere_evenements DROP CONSTRAINT IF EXISTS carriere_evenements_updated_by_fkey;
ALTER TABLE carriere_evenements ADD CONSTRAINT carriere_evenements_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE conges DROP CONSTRAINT IF EXISTS conges_reviewed_by_fkey;
ALTER TABLE conges ADD CONSTRAINT conges_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE conges DROP CONSTRAINT IF EXISTS conges_validateur_id_fkey;
ALTER TABLE conges ADD CONSTRAINT conges_validateur_id_fkey
  FOREIGN KEY (validateur_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE conges DROP CONSTRAINT IF EXISTS conges_user_id_fkey;
ALTER TABLE conges ADD CONSTRAINT conges_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE corbeille DROP CONSTRAINT IF EXISTS corbeille_supprime_par_fkey;
ALTER TABLE corbeille ADD CONSTRAINT corbeille_supprime_par_fkey
  FOREIGN KEY (supprime_par) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE demandes_documents DROP CONSTRAINT IF EXISTS demandes_documents_traite_par_fkey;
ALTER TABLE demandes_documents ADD CONSTRAINT demandes_documents_traite_par_fkey
  FOREIGN KEY (traite_par) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE documents_generes DROP CONSTRAINT IF EXISTS documents_generes_genere_par_fkey;
ALTER TABLE documents_generes ADD CONSTRAINT documents_generes_genere_par_fkey
  FOREIGN KEY (genere_par) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE fonction_history DROP CONSTRAINT IF EXISTS fonction_history_changed_by_fkey;
ALTER TABLE fonction_history ADD CONSTRAINT fonction_history_changed_by_fkey
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE fonction_history DROP CONSTRAINT IF EXISTS fonction_history_user_id_fkey;
ALTER TABLE fonction_history ADD CONSTRAINT fonction_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_sent_by_fkey;
ALTER TABLE invitations ADD CONSTRAINT invitations_sent_by_fkey
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_created_user_id_fkey;
ALTER TABLE invitations ADD CONSTRAINT invitations_created_user_id_fkey
  FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_recipient_id_fkey
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE parametres_carriere DROP CONSTRAINT IF EXISTS parametres_carriere_updated_by_fkey;
ALTER TABLE parametres_carriere ADD CONSTRAINT parametres_carriere_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE password_reset_tokens ADD CONSTRAINT password_reset_tokens_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE personnel_diplomes DROP CONSTRAINT IF EXISTS personnel_diplomes_created_by_fkey;
ALTER TABLE personnel_diplomes ADD CONSTRAINT personnel_diplomes_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE situations_administratives DROP CONSTRAINT IF EXISTS situations_administratives_created_by_fkey;
ALTER TABLE situations_administratives ADD CONSTRAINT situations_administratives_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

COMMIT;