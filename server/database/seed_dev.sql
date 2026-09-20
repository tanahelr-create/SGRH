-- =============================================================================
-- SGRH — seed de DÉVELOPPEMENT (données entièrement fictives)
-- =============================================================================
-- À exécuter après schema.sql et seed_reference.sql, sur une base de développement
-- vide. Aucune donnée personnelle réelle : noms « DEMO », e-mails @example.test,
-- matricules 1000xx (6 chiffres). Mot de passe de tous les comptes : Demo1234!
--
-- Scénarios couverts : les 4 rôles, chef de service et validation à deux niveaux des
-- congés, soldes cohérents (droits annuels, imputations, photographie du solde),
-- congés historiques et état de congé, décision d'octroi, carrière (indice 950-FOP =
-- indice, jamais matricule), situations administratives (une seule ouverte), contrats
-- avec renouvellement, alertes d'avancement, documents et demandes, notifications
-- avec lien, journal d'activité, corbeille, invitations, OTP et jetons.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Personnel (matricule = 6 chiffres ; 950-FOP est un INDICE)
-- ---------------------------------------------------------------------------
INSERT INTO personnel (matricule, nom, prenom, email, fonction, corps, grade, service, direction, telephone, type_contrat,
                       role, date_recrutement, date_echeance_contrat, contrat_permanent, solde_conges, derniere_recharge_annee,
                       indice, chapitre_ib, lieu_naissance, date_naissance, nationalite, situation_familiale, adresse, sexe,
                       date_prise_fonction, poste, classe, echelon, categorie_id, indice_num, indice_source)
VALUES
 ('100001', 'DEMO-CHEF', 'Alix', 'chef.demo@example.test', 'Chef de service', 'Fonctionnaire', '2ème Classe, 3ème Echelon',
  'Service de Maintenance Informatique', 'Direction des Technologies de l''Information et de la Communication', '0340000001', 'CDI',
  'PE', '2015-03-02', NULL, TRUE, 0, NULL, '850-FOP', '00 870 110', 'Mahajanga', '1980-04-12', 'Malagasy', 'Marié(e)',
  'Lot DEMO 1, Mahajanga', 'Masculin', '2015-03-02', 'Chef du service maintenance', 'DEUXIEME_CLASSE', '3',
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT6'), 850, 'SAISIE_RH'),
 ('100002', 'DEMO-PROF', 'Bao', 'prof.demo@example.test', 'Enseignant Chercheur', 'EFA', 'Maître assistant',
  NULL, 'Direction des Technologies de l''Information et de la Communication', '0340000002', 'CDI',
  'PE', '2018-09-01', NULL, TRUE, 0, NULL, NULL, '00 870 110', 'Antananarivo', '1985-11-03', 'Malagasy', 'Célibataire',
  'Lot DEMO 2, Mahajanga', 'Féminin', '2018-09-01', 'Enseignant chercheur', NULL, NULL,
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT8'), NULL, 'A_CONFIRMER'),
 ('100003', 'DEMO-AGENT', 'Cleo', 'agent.demo@example.test', 'Agent', 'ELD', NULL,
  'Service de Maintenance Informatique', 'Direction des Technologies de l''Information et de la Communication', '0340000003', 'CDD',
  'PAT', '2024-01-01', '2027-03-31', FALSE, 65, 2026, NULL, NULL, 'Mahajanga', '1995-02-20', 'Malagasy', 'Célibataire',
  'Lot DEMO 3, Mahajanga', 'Féminin', '2024-01-01', 'Technicien réseau', NULL, NULL,
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT4'), NULL, 'A_CONFIRMER'),
 ('100004', 'DEMO-INVITE', 'Dana', 'invite.demo@example.test', 'Agent', 'ELD', NULL,
  'Service Financier', 'Direction des Affaires Administratives et Financières', '0340000004', 'CDD',
  'PAT', '2026-06-01', '2027-05-31', FALSE, 0, NULL, NULL, NULL, NULL, NULL, 'Malagasy', NULL,
  NULL, NULL, '2026-06-01', 'Agent financier', NULL, NULL,
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT3'), NULL, 'A_CONFIRMER'),
 ('100005', 'DEMO-STAGIAIRE', 'Eli', 'stagiaire.demo@example.test', 'Agent', 'Fonctionnaire', 'Stagiaire',
  'Service Financier', 'Direction des Affaires Administratives et Financières', '0340000005', 'Stagiaire',
  'PAT', '2026-01-01', '2026-12-31', FALSE, 30, 2026, NULL, '00 870 120', 'Mahajanga', '1998-07-08', 'Malagasy', 'Célibataire',
  'Lot DEMO 5, Mahajanga', 'Masculin', '2026-01-01', 'Agent stagiaire', NULL, NULL,
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT5'), NULL, 'A_CONFIRMER'),
 ('100006', 'DEMO-RESP', 'Fara', 'resp.demo@example.test', 'Responsable/Directeur', 'Fonctionnaire', '1ère Classe, 2ème Echelon',
  'Service de la Gestion des Ressources Humaines', 'Direction des Affaires Administratives et Financières', '0340000006', 'CDI',
  'PAT', '2010-05-10', NULL, TRUE, 0, NULL, '1100-FOP', '00 870 110', 'Mahajanga', '1975-09-30', 'Malagasy', 'Marié(e)',
  'Lot DEMO 6, Mahajanga', 'Féminin', '2010-05-10', 'Directrice des affaires administratives', 'PREMIERE_CLASSE', '2',
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT8'), 1100, 'SAISIE_RH'),
 ('100007', 'DEMO-ETAT', 'Gino', 'etat.demo@example.test', 'Chef de service', 'EFA', 'Stagiaire',
  'Service d''Administration Réseau et Informatisation', 'Direction des Technologies de l''Information et de la Communication', '0340000007', 'CDI',
  'PAT', '2016-11-01', NULL, TRUE, 229, 2024, '950-FOP', '00 870 110', 'Mahajanga', '1988-01-15', 'Malagasy', 'Marié(e)',
  'Lot DEMO 7, Mahajanga', 'Masculin', '2016-11-01', 'Chef de service réseau', NULL, NULL,
  (SELECT id FROM categories_professionnelles WHERE code = 'CAT8'), 950, 'SAISIE_RH'),
 ('100008', 'DEMO-ATTENTE', 'Hery', 'attente.demo@example.test', 'Agent', 'ELD', NULL,
  'Service du Patrimoine', 'Direction du Patrimoine', '0340000008', 'Vacataire',
  'PAT', NULL, NULL, FALSE, 0, NULL, NULL, NULL, NULL, NULL, 'Malagasy', NULL,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 'A_CONFIRMER'),
 ('100009', 'DEMO-SUPPRIME', 'Iris', 'supprime.demo@example.test', 'Agent', 'EFA', NULL,
  'Service du Patrimoine', 'Direction du Patrimoine', '0340000009', 'CDI',
  'PAT', '2019-02-01', NULL, TRUE, 0, NULL, NULL, NULL, NULL, NULL, 'Malagasy', NULL,
  NULL, NULL, '2019-02-01', NULL, NULL, NULL,
  NULL, NULL, 'A_CONFIRMER');

-- Responsables d'organisation (fonction Chef de service / Responsable).
UPDATE services SET responsable_personnel_id = (SELECT id FROM personnel WHERE matricule = '100001') WHERE nom = 'Service de Maintenance Informatique';
UPDATE directions SET responsable_personnel_id = (SELECT id FROM personnel WHERE matricule = '100006') WHERE nom = 'Direction des Affaires Administratives et Financières';

-- ---------------------------------------------------------------------------
-- Comptes (mot de passe : Demo1234!) — SUPERADMIN et ADMIN_RH sans fiche personnel
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password_hash, role, status, personnel_id) VALUES
 ('superadmin.demo@example.test', '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'SUPERADMIN', 'active', NULL),
 ('adminrh.demo@example.test',    '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'ADMIN_RH',   'active', NULL),
 ('chef.demo@example.test',       '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PE',  'active',  (SELECT id FROM personnel WHERE matricule = '100001')),
 ('prof.demo@example.test',       '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PE',  'active',  (SELECT id FROM personnel WHERE matricule = '100002')),
 ('agent.demo@example.test',      '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PAT', 'active',  (SELECT id FROM personnel WHERE matricule = '100003')),
 ('stagiaire.demo@example.test',  '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PAT', 'active',  (SELECT id FROM personnel WHERE matricule = '100005')),
 ('resp.demo@example.test',       '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PAT', 'active',  (SELECT id FROM personnel WHERE matricule = '100006')),
 ('etat.demo@example.test',       '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PAT', 'active',  (SELECT id FROM personnel WHERE matricule = '100007')),
 ('attente.demo@example.test',    '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q', 'PAT', 'pending', (SELECT id FROM personnel WHERE matricule = '100008'));
-- 100004 (invité) n'a pas encore de compte ; 100009 a été supprimé (voir corbeille).

-- ---------------------------------------------------------------------------
-- Historique de fonction (rattaché au compte)
-- ---------------------------------------------------------------------------
INSERT INTO fonction_history (user_id, ancienne_fonction, nouvelle_fonction, changed_by, changed_at) VALUES
 ((SELECT id FROM users WHERE email = 'chef.demo@example.test'), 'Agent', 'Chef de service',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2020-01-15 09:00:00'),
 ((SELECT id FROM users WHERE email = 'etat.demo@example.test'), 'Agent', 'Chef de service',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2023-01-10 09:00:00');

-- ---------------------------------------------------------------------------
-- Carrière, diplômes, situations administratives, alertes
-- ---------------------------------------------------------------------------
INSERT INTO carriere_evenements (personnel_id, type_evenement, description, date_evenement, date_effet, created_by, corps, grade, classe, echelon, indice, fonction, affectation, reference_decision, autorite_decision, indice_source, indice_num, ligne_grille_id)
VALUES
 ((SELECT id FROM personnel WHERE matricule = '100001'), 'Recrutement', 'Recrutement à l''université', '2015-03-02', '2015-03-02',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'Fonctionnaire', '3ème Classe', 'DEUXIEME_CLASSE', '1', '650-FOP', 'Agent', 'Service de Maintenance Informatique', 'Décision 001/2015', 'Président', 'SAISIE_RH', 650, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100001'), 'Avancement d''échelon', 'Avancement automatique après 2 ans', '2020-03-02', '2020-03-02',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'Fonctionnaire', '2ème Classe, 3ème Echelon', 'DEUXIEME_CLASSE', '3', '850-FOP', 'Chef de service', NULL, 'Décision 045/2020', 'Président', 'SAISIE_RH', 850, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 'Recrutement', 'Recrutement', '2016-11-01', '2016-11-01',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'EFA', '2ème Classe, 3ème Echelon', 'DEUXIEME_CLASSE', '3', '850-FOP', 'Agent', NULL, 'Décision 120/2016', 'Président', 'SAISIE_RH', 850, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 'Avancement de grade', 'Passage stagiaire', '2023-01-01', '2023-01-01',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'EFA', 'Stagiaire', NULL, NULL, '950-FOP', 'Chef de service', NULL, 'Décision 010/2023', 'Président', 'SAISIE_RH', 950, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100006'), 'Titularisation', 'Titularisation classe exceptionnelle (indice réglementaire)', '2022-06-01', '2022-06-01',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'Fonctionnaire', 'Classe exceptionnelle', 'CLASSE_EXCEPTIONNELLE', '2', '675', 'Responsable/Directeur', NULL, 'Décision 080/2022', 'Président', 'REGLEMENTAIRE', 675,
  (SELECT id FROM lignes_grille_indiciaire WHERE categorie = 'I' AND classe = 'CLASSE_EXCEPTIONNELLE' AND echelon = 2));

INSERT INTO personnel_diplomes (personnel_id, intitule, etablissement, annee_obtention, created_by) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100002'), 'Doctorat en informatique', 'Université fictive de Démonstration', 2016, (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100003'), 'DTS Réseaux', 'Institut fictif de Démonstration', 2015, (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

-- Situations : une seule ouverte par personnel ; la précédente se termine la veille.
INSERT INTO situations_administratives (personnel_id, type_situation_id, date_debut, date_fin, reference_decision, motif, created_by) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100001'), (SELECT id FROM types_situation_administrative WHERE code = 'STAGIAIRE_GRADE'), '2015-03-02', '2016-03-01', 'Décision 001/2015', 'Recrutement', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100001'), (SELECT id FROM types_situation_administrative WHERE code = 'TITULAIRE'), '2016-03-02', NULL, 'Décision 020/2016', 'Titularisation', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100005'), (SELECT id FROM types_situation_administrative WHERE code = 'STAGIAIRE_CLASSIQUE'), '2026-01-01', NULL, 'Décision 003/2026', 'Recrutement', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), (SELECT id FROM types_situation_administrative WHERE code = 'EFA'), '2016-11-01', NULL, 'Décision 120/2016', 'Recrutement', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

INSERT INTO alertes_avancement (personnel_id, type, date_echeance_theorique, statut, details, evenement_resultant_id, traite_at, traite_par) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100001'), 'AVANCEMENT_ECHELON_ECHU', '2026-03-02', 'OUVERTE', '{"classe":"DEUXIEME_CLASSE","echelon":"3","source":"seed"}', NULL, NULL, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 'DOSSIER_INCOMPLET', NULL, 'TRAITEE', '{"manque":"classe"}',
  (SELECT id FROM carriere_evenements WHERE personnel_id = (SELECT id FROM personnel WHERE matricule = '100007') AND type_evenement = 'Avancement de grade'),
  '2023-01-05 10:00:00', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

-- ---------------------------------------------------------------------------
-- Contrats : renouvellement (CDD), stagiaire actif, non-renouvellement motivé
-- ---------------------------------------------------------------------------
INSERT INTO contrats (personnel_id, type_contrat, date_debut, date_fin, numero_renouvellement, statut, decision, reference_decision, observations, created_by)
VALUES ((SELECT id FROM personnel WHERE matricule = '100003'), 'CDD', '2024-01-01', '2025-12-31', 0, 'renouvele', 'renouvele_renegociation', 'Contrat 001/2024', 'Premier contrat', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));
INSERT INTO contrats (personnel_id, type_contrat, date_debut, date_fin, numero_renouvellement, contrat_precedent_id, statut, reference_decision, created_by)
VALUES ((SELECT id FROM personnel WHERE matricule = '100003'), 'CDD', '2026-01-01', '2027-03-31', 1,
        (SELECT id FROM contrats WHERE personnel_id = (SELECT id FROM personnel WHERE matricule = '100003') AND numero_renouvellement = 0),
        'actif', 'Contrat 002/2026', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));
INSERT INTO contrats (personnel_id, type_contrat, date_debut, date_fin, statut, reference_decision, created_by)
VALUES ((SELECT id FROM personnel WHERE matricule = '100005'), 'Stagiaire', '2026-01-01', '2026-12-31', 'actif', 'Contrat 003/2026', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));
INSERT INTO contrats (personnel_id, type_contrat, date_debut, date_fin, statut, decision, motif_non_renouvellement, created_by)
VALUES ((SELECT id FROM personnel WHERE matricule = '100009'), 'CDD', '2024-02-01', '2025-01-31', 'non_renouvele', 'non_renouvele',
        'Fin de besoin du service (donnée fictive)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

INSERT INTO documents_contrat (contrat_id, type_document, filename, path, mime_type, taille_octets, importe_par) VALUES
 ((SELECT id FROM contrats WHERE reference_decision = 'Contrat 002/2026'), 'contrat_original', 'contrat-demo-002-2026.pdf', '/uploads/contrats/demo-002-2026.pdf', 'application/pdf', 20480,
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

-- ---------------------------------------------------------------------------
-- Congés : droits annuels, demandes (validation chef puis RH), imputations, historiques
-- Invariant vérifié par les tests : solde_conges = somme des restants par année.
--   100003 : 2024 (30-15-10=5) + 2025 (30) + 2026 (30) = 65
--   100005 : 2026 (30, la demande refusée ne compte pas) = 30
--   100007 : 2017 (34-15=19) + 2018..2024 (7 x 30) = 229
-- ---------------------------------------------------------------------------
INSERT INTO conges_droits_annuels (personnel_id, annee, libelle_periode, droit, source, reference, created_by) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100003'), 2024, NULL, 30, 'CALCULE', NULL, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100003'), 2025, NULL, 30, 'CALCULE', NULL, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100003'), 2026, NULL, 30, 'CALCULE', NULL, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100005'), 2026, NULL, 30, 'CALCULE', NULL, NULL),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2017, '2016-2017', 34, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2018, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2019, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2020, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2021, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2022, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2023, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test')),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2024, NULL, 30, 'OUVERTURE', 'État de congé (démo)', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

INSERT INTO conges_historiques (personnel_id, annee, date_debut, date_fin, jours, reference, lieu_jouissance, created_by) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100007'), 2017, '2023-06-22', '2023-07-06', 15, 'État de congé (démo)', 'Bealanana',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'));

INSERT INTO conges (user_id, type_conge, date_debut, date_fin, motif, status, reviewed_by, reviewed_at, created_at, avis_chef_service,
                    lieu_jouissance, date_reprise_service, remplacant, validateur_id, decision_intermediaire, decision_intermediaire_le,
                    justificatif_filename, justificatif_path, solde_avant, solde_apres)
VALUES
 -- A : congé annuel approuvé (chef puis RH), 15 jours imputés sur 2024
 ((SELECT id FROM users WHERE email = 'agent.demo@example.test'), 'Congé annuel', '2025-07-01', '2025-07-15', 'Repos annuel', 'approuvee',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2025-06-20 10:00:00', '2025-06-15 09:00:00', 'Avis favorable',
  'Mahajanga', '2025-07-16', 'DEMO-PROF', (SELECT id FROM users WHERE email = 'chef.demo@example.test'), 'approuvee', '2025-06-16 08:30:00',
  NULL, NULL, 60, 45),
 -- B : congé annuel en attente de la décision RH (le chef a déjà donné un avis favorable)
 ((SELECT id FROM users WHERE email = 'agent.demo@example.test'), 'Congé annuel', '2026-11-02', '2026-11-11', 'Congé de fin d''année', 'en_attente',
  NULL, NULL, '2026-09-15 09:00:00', 'Avis favorable',
  'Mahajanga', '2026-11-12', NULL, (SELECT id FROM users WHERE email = 'chef.demo@example.test'), 'approuvee', '2026-09-16 08:00:00',
  NULL, NULL, 75, 65),
 -- C : permission (ne consomme pas le solde : avant = après)
 ((SELECT id FROM users WHERE email = 'agent.demo@example.test'), 'Permission', '2026-08-10', '2026-08-12', 'Événement familial', 'approuvee',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-08-05 15:00:00', '2026-08-01 09:00:00', NULL,
  NULL, '2026-08-13', NULL, (SELECT id FROM users WHERE email = 'chef.demo@example.test'), 'approuvee', '2026-08-02 08:00:00',
  NULL, NULL, 75, 75),
 -- D : congé annuel refusé par la RH (les jours sont restitués, l'imputation reste exclue du « pris »)
 ((SELECT id FROM users WHERE email = 'stagiaire.demo@example.test'), 'Congé annuel', '2026-10-05', '2026-10-19', 'Congé', 'refusee',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-09-10 11:00:00', '2026-09-05 09:00:00', 'Période de forte activité',
  NULL, NULL, NULL, NULL, 'non_requise', NULL,
  NULL, NULL, 30, 15),
 -- E : congé de maladie avec justificatif
 ((SELECT id FROM users WHERE email = 'stagiaire.demo@example.test'), 'Congé de maladie', '2026-09-01', '2026-09-02', 'Grippe', 'approuvee',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-09-03 09:00:00', '2026-09-02 08:00:00', NULL,
  NULL, '2026-09-03', NULL, NULL, 'non_requise', NULL,
  'certificat-medical-demo.pdf', '/uploads/justificatifs-conges/certificat-medical-demo.pdf', 30, 30);

INSERT INTO conges_imputations (conge_id, annee, jours) VALUES
 ((SELECT id FROM conges WHERE date_debut = '2025-07-01' AND user_id = (SELECT id FROM users WHERE email = 'agent.demo@example.test')), 2024, 15),
 ((SELECT id FROM conges WHERE date_debut = '2026-11-02' AND user_id = (SELECT id FROM users WHERE email = 'agent.demo@example.test')), 2024, 10),
 ((SELECT id FROM conges WHERE date_debut = '2026-10-05' AND user_id = (SELECT id FROM users WHERE email = 'stagiaire.demo@example.test')), 2026, 15);

-- ---------------------------------------------------------------------------
-- Documents administratifs (instantanés JSON tels que produits par le backend) et demandes
-- ---------------------------------------------------------------------------
INSERT INTO documents_generes (personnel_id, type_document, donnees, genere_par, genere_le) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100001'), 'certificat_administratif',
  '{"numero":"1-CA/2026/UMG/PR/DAAF/SGRH","nomSignataire":"DEMO Directeur","fonctionSignataire":"Directeur des Affaires Administratives et Financières"}',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-03-10 10:00:00'),
 ((SELECT id FROM personnel WHERE matricule = '100003'), 'lettre_confirmation',
  '{"numero":"1-LC/2026/UMG/PR/DAAF/SGRH","nomSignataire":"DEMO Directeur","fonctionSignataire":"Directeur des Affaires Administratives et Financières","dateRenouvellement":"2027-01-01"}',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-04-02 10:00:00'),
 ((SELECT id FROM personnel WHERE matricule = '100007'), 'etat_conge',
  '{"numero":"1-EC/2026/UMG/PR/DAAF/SGRH","nom":"DEMO-ETAT","prenom":"Gino","matricule":"100007","statut":"EFA","fonction":"Chef de service","service":"Service d''Administration Réseau et Informatisation","lignes":[{"annee":2017,"libellePeriode":"2016-2017","droit":34,"conges":[{"dateDebut":"2023-06-22","dateFin":"2023-07-06","jours":15}],"pris":15,"restant":19},{"annee":2018,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30},{"annee":2019,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30},{"annee":2020,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30},{"annee":2021,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30},{"annee":2022,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30},{"annee":2023,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30},{"annee":2024,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30}],"ouverture":null,"total":229,"totalEnLettres":"deux cent vingt-neuf jours","totalEnChiffres":229,"arreteLe":"2026-09-21"}',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-09-21 09:00:00'),
 ((SELECT id FROM personnel WHERE matricule = '100005'), 'etat_conge',
  '{"numero":"2-EC/2026/UMG/PR/DAAF/SGRH","nom":"DEMO-STAGIAIRE","prenom":"Eli","matricule":"100005","statut":"Fonctionnaire","fonction":"Agent","service":"Service Financier","lignes":[{"annee":2026,"libellePeriode":null,"droit":30,"conges":[],"pris":0,"restant":30}],"ouverture":null,"total":30,"totalEnLettres":"trente jours","totalEnChiffres":30,"arreteLe":"2026-09-21"}',
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-09-21 09:30:00');

INSERT INTO documents_generes (personnel_id, type_document, donnees, genere_par, genere_le)
SELECT p.id, 'decision_conge',
  jsonb_build_object('congeId', c.id, 'nom', 'DEMO-AGENT', 'prenom', 'Cleo',
    'ancienne', jsonb_build_object('iM', '100003', 'budget', NULL, 'corps', 'Technicien supérieur', 'grade', NULL, 'fonction', 'Agent', 'indice', NULL),
    'nouvelle', jsonb_build_object('iM', '100003', 'budget', NULL, 'corps', 'Technicien supérieur', 'grade', NULL, 'fonction', 'Agent', 'indice', NULL),
    'jours', 15, 'joursEnLettres', 'quinze jours', 'anneesService', jsonb_build_array(2024), 'soldeAnterieur', false,
    'lieuJouissance', 'Mahajanga', 'dateDepart', '2025-07-01', 'dateReprise', '2025-07-16', 'dateNotification', '2025-06-25',
    'service', 'Service de Maintenance Informatique',
    'ampliation', jsonb_build_array(
      jsonb_build_object('destinataire', 'PRESIDENT', 'mention', 'A titre compte rendu'),
      jsonb_build_object('destinataire', 'DAAF', 'mention', 'A titre compte rendu'),
      jsonb_build_object('destinataire', 'Service Personnel', 'mention', 'Archives'),
      jsonb_build_object('destinataire', 'Service de l''intéressé(e)', 'mention', 'Service de Maintenance Informatique'),
      jsonb_build_object('destinataire', 'Intéressé(e)', 'mention', 'Pour notification')),
    'numero', '1/2026/UMG/PR/DAAF/PERS'),
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2025-06-25 10:00:00'
FROM personnel p, conges c
WHERE p.matricule = '100003' AND c.date_debut = '2025-07-01' AND c.user_id = (SELECT id FROM users WHERE email = 'agent.demo@example.test');

INSERT INTO documents_generes (personnel_id, type_document, donnees, genere_par, genere_le)
SELECT p.id, 'decision_conge',
  jsonb_build_object('historiqueId', h.id, 'nom', 'DEMO-ETAT', 'prenom', 'Gino',
    'ancienne', jsonb_build_object('iM', '100007', 'budget', '00 870 110', 'corps', 'Concepteur', 'grade', '2ème Classe, 3ème Echelon', 'fonction', 'Agent', 'indice', '850-FOP'),
    'nouvelle', jsonb_build_object('iM', '100007', 'budget', '00 870 110', 'corps', 'Concepteur', 'grade', 'Stagiaire', 'fonction', 'Chef de service', 'indice', '950-FOP'),
    'jours', 15, 'joursEnLettres', 'quinze jours', 'anneesService', jsonb_build_array(2017), 'soldeAnterieur', false,
    'lieuJouissance', 'Bealanana', 'dateDepart', '2023-06-22', 'dateReprise', '2023-07-07', 'dateNotification', '2026-09-21',
    'service', 'Service d''Administration Réseau et Informatisation',
    'ampliation', jsonb_build_array(
      jsonb_build_object('destinataire', 'PRESIDENT', 'mention', 'A titre compte rendu'),
      jsonb_build_object('destinataire', 'DAAF', 'mention', 'A titre compte rendu'),
      jsonb_build_object('destinataire', 'Service Personnel', 'mention', 'Archives'),
      jsonb_build_object('destinataire', 'Service de l''intéressé(e)', 'mention', 'Service d''Administration Réseau et Informatisation'),
      jsonb_build_object('destinataire', 'Intéressé(e)', 'mention', 'Pour notification')),
    'numero', '2/2026/UMG/PR/DAAF/PERS'),
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-09-21 09:15:00'
FROM personnel p, conges_historiques h
WHERE p.matricule = '100007' AND h.personnel_id = p.id AND h.date_debut = '2023-06-22';

INSERT INTO demandes_documents (personnel_id, type_document, motif, statut, document_id, traite_par, date_demande, date_traitement) VALUES
 ((SELECT id FROM personnel WHERE matricule = '100003'), 'certificat_administratif', 'Dossier de prêt bancaire', 'en_attente', NULL, NULL, '2026-09-18 08:00:00', NULL),
 ((SELECT id FROM personnel WHERE matricule = '100005'), 'etat_conge', 'Vérification de mes droits', 'traitee',
  (SELECT id FROM documents_generes WHERE type_document = 'etat_conge' AND personnel_id = (SELECT id FROM personnel WHERE matricule = '100005')),
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-09-20 08:00:00', '2026-09-21 09:30:00'),
 ((SELECT id FROM personnel WHERE matricule = '100002'), 'lettre_confirmation', 'Test', 'refusee', NULL,
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-08-01 08:00:00', '2026-08-02 08:00:00');

-- ---------------------------------------------------------------------------
-- Notifications (avec lien de navigation), journal d'activité, corbeille
-- ---------------------------------------------------------------------------
INSERT INTO notifications (sender_id, recipient_id, title, message, type, is_read, created_at, lien) VALUES
 ((SELECT id FROM users WHERE email = 'chef.demo@example.test'), (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'),
  'Demande de congé à valider', 'Une demande de "Congé annuel" a été approuvée par le responsable direct, en attente de votre décision finale.', 'conge', FALSE, '2026-09-16 08:00:00', '/admin/conges'),
 ((SELECT id FROM users WHERE email = 'agent.demo@example.test'), (SELECT id FROM users WHERE email = 'chef.demo@example.test'),
  'Nouvelle demande de congé (votre équipe)', 'Une demande de "Congé annuel" de Cleo DEMO-AGENT attend votre avis.', 'conge', TRUE, '2026-09-15 09:00:00', '/validation-equipe'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), (SELECT id FROM users WHERE email = 'agent.demo@example.test'),
  'Congé approuvé', 'Votre demande de "Congé annuel" du 2025-07-01 au 2025-07-15 a été approuvée.', 'conge', TRUE, '2025-06-20 10:00:00', '/conges'),
 (NULL, (SELECT id FROM users WHERE email = 'agent.demo@example.test'),
  'Échéance de contrat', 'Votre contrat CDD arrive à échéance dans moins de 6 mois.', 'echeance', FALSE, '2026-09-19 06:00:00', '/mes-contrats'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), (SELECT id FROM users WHERE email = 'stagiaire.demo@example.test'),
  'Congé refusé', 'Votre demande de "Congé annuel" du 2026-10-05 au 2026-10-19 a été refusée.', 'conge', FALSE, '2026-09-10 11:00:00', '/conges'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), (SELECT id FROM users WHERE email = 'chef.demo@example.test'),
  'Changement de situation administrative', 'Votre situation administrative a été mise à jour : Titulaire.', 'info', TRUE, '2016-03-02 08:00:00', '/carriere'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), (SELECT id FROM users WHERE email = 'prof.demo@example.test'),
  'Réunion du personnel', 'Réunion générale le 30 septembre 2026 à 9h (message fictif).', 'reunion', FALSE, '2026-09-20 16:00:00', NULL),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), (SELECT id FROM users WHERE email = 'etat.demo@example.test'),
  'Document prêt', 'Votre état de congé est disponible.', 'info', FALSE, '2026-09-21 09:00:00', '/mes-documents');

INSERT INTO activity_log (user_id, action_type, description, created_at) VALUES
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'connexion', 'Connexion réussie (adminrh.demo@example.test)', '2026-09-21 08:00:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'personnel_cree', 'Fiche personnel créée : 100003 — DEMO-AGENT Cleo', '2024-01-02 09:00:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'contrat_renouvele', 'Contrat renouvelé pour la fiche DEMO-AGENT', '2026-01-02 09:00:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'situation_administrative', 'Nouvelle situation administrative enregistrée pour la fiche DEMO-CHEF', '2016-03-02 08:00:00'),
 ((SELECT id FROM users WHERE email = 'agent.demo@example.test'), 'conge_demande', 'Demande de "Congé annuel" soumise (15 jour(s))', '2025-06-15 09:00:00'),
 ((SELECT id FROM users WHERE email = 'chef.demo@example.test'), 'conge_avis_intermediaire', 'Demande de congé : avis intermédiaire "approuvee"', '2025-06-16 08:30:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'conge_traite', 'Demande de congé approuvée', '2025-06-20 10:00:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'conge_ouverture_saisie', 'Soldes d''ouverture saisis pour la fiche DEMO-ETAT : solde 0 -> 229', '2026-09-21 08:30:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'document_genere', 'Document "etat_conge" généré pour DEMO-ETAT', '2026-09-21 09:00:00'),
 ((SELECT id FROM users WHERE email = 'superadmin.demo@example.test'), 'permission_modifiee', 'Permissions du rôle PAT consultées (donnée fictive)', '2026-09-20 17:00:00'),
 ((SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), 'compte_supprime', 'Compte supprimé (déplacé dans la corbeille) : supprime.demo@example.test', '2026-08-30 10:00:00');

-- Corbeille : compte supprimé, restaurable depuis l'interface Super Admin.
INSERT INTO corbeille (type_element, donnees, supprime_par, supprime_le)
VALUES ('compte',
  jsonb_build_object(
    'user', jsonb_build_object('id', 9001, 'role', 'PAT', 'email', 'supprime.demo@example.test', 'password_hash', '$2b$10$aNpnm4AeXINZHTd6Xmr7d.JKBxewz/H8jtZP7EmHvwUj.h2U2vo8q',
                               'personnel_id', (SELECT id FROM personnel WHERE matricule = '100009'), 'status', 'active', 'created_at', '2025-01-10T08:00:00.000Z'),
    'conges', '[]'::jsonb, 'fonctionHistory', '[]'::jsonb, 'notifications', '[]'::jsonb, 'imputations', '[]'::jsonb),
  (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), '2026-08-30 10:00:00');

-- ---------------------------------------------------------------------------
-- Invitations, codes OTP, jetons de réinitialisation
-- ---------------------------------------------------------------------------
INSERT INTO invitations (email, role, token, status, submitted_data, sent_by, created_user_id, created_at, expires_at, fonction, matricule) VALUES
 ('invite.demo@example.test', 'PAT', 'demo-token-envoyee-0001', 'envoyee', NULL, (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), NULL, '2026-09-19 09:00:00', '2026-12-31 00:00:00', 'Agent', '100004'),
 ('soumise.demo@example.test', 'PE', 'demo-token-soumise-0002', 'soumise', '{"nom":"DEMO-SOUMIS","prenom":"Jo","telephone":"0340000010"}', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), NULL, '2026-09-10 09:00:00', '2026-12-31 00:00:00', 'Enseignant', '100010'),
 ('prof.demo@example.test', 'PE', 'demo-token-confirmee-0003', 'confirmee', '{"nom":"DEMO-PROF","prenom":"Bao"}', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), (SELECT id FROM users WHERE email = 'prof.demo@example.test'), '2018-08-01 09:00:00', '2018-12-31 00:00:00', 'Enseignant Chercheur', '100002'),
 ('refusee.demo@example.test', 'PAT', 'demo-token-refusee-0004', 'refusee', '{"nom":"DEMO-REFUSE","prenom":"Ko"}', (SELECT id FROM users WHERE email = 'adminrh.demo@example.test'), NULL, '2026-08-01 09:00:00', '2026-12-31 00:00:00', 'Agent', '100011');

INSERT INTO otp_codes (email, code, used, expires_at) VALUES
 ('invite.demo@example.test', '1234', FALSE, '2026-12-31 00:00:00'),
 ('agent.demo@example.test', '4321', TRUE, '2026-01-01 00:00:00');

INSERT INTO password_reset_tokens (user_id, token, used, expires_at) VALUES
 ((SELECT id FROM users WHERE email = 'agent.demo@example.test'), 'demo-reset-token-0001', FALSE, '2026-12-31 00:00:00');

COMMIT;
