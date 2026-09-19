-- Historique des contrats (Phases 3, 6) + leurs documents PDF (Phase 4/5).
-- Aucun contrat ni document n'est jamais supprimé par l'application (Phase 20).
BEGIN;

CREATE TABLE IF NOT EXISTS contrats (
    id                          SERIAL PRIMARY KEY,
    personnel_id                INTEGER NOT NULL REFERENCES personnel(id),
    type_contrat                VARCHAR(20) NOT NULL,
    date_debut                  DATE NOT NULL,
    date_fin                    DATE,
    numero_renouvellement       INTEGER NOT NULL DEFAULT 0,
    contrat_precedent_id        INTEGER REFERENCES contrats(id) ON DELETE SET NULL,
    statut                      VARCHAR(20) NOT NULL DEFAULT 'actif',
    decision                    VARCHAR(30),
    motif_non_renouvellement    TEXT,
    reference_decision          VARCHAR(150),
    observations                TEXT,
    notifie_echeance_le         TIMESTAMP,
    created_by                  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by                  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP,
    CONSTRAINT contrats_type_contrat_check CHECK (type_contrat IN ('CDI', 'CDD', 'Vacataire', 'Stagiaire')),
    CONSTRAINT contrats_statut_check CHECK (statut IN ('actif', 'expire', 'renouvele', 'non_renouvele', 'resilie')),
    CONSTRAINT contrats_decision_check CHECK (decision IS NULL OR decision IN ('renouvele_renegociation', 'non_renouvele')),
    CONSTRAINT contrats_dates_check CHECK (date_fin IS NULL OR date_fin >= date_debut),
    CONSTRAINT contrats_motif_non_renouvellement_check CHECK (
        decision IS DISTINCT FROM 'non_renouvele'
        OR (motif_non_renouvellement IS NOT NULL AND btrim(motif_non_renouvellement) <> '')
    )
);

CREATE INDEX IF NOT EXISTS idx_contrats_personnel_id ON contrats(personnel_id);
CREATE INDEX IF NOT EXISTS idx_contrats_date_fin ON contrats(date_fin);
CREATE INDEX IF NOT EXISTS idx_contrats_statut ON contrats(statut);

CREATE TABLE IF NOT EXISTS documents_contrat (
    id              SERIAL PRIMARY KEY,
    contrat_id      INTEGER NOT NULL REFERENCES contrats(id) ON DELETE CASCADE,
    type_document   VARCHAR(30) NOT NULL DEFAULT 'contrat_original',
    filename        VARCHAR(255) NOT NULL,
    path            VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(100),
    taille_octets   INTEGER,
    importe_par     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    importe_le      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT documents_contrat_type_check CHECK (type_document IN ('contrat_original', 'avenant', 'autre'))
);

CREATE INDEX IF NOT EXISTS idx_documents_contrat_contrat_id ON documents_contrat(contrat_id);

COMMIT;