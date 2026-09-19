-- Alertes RH liées aux échéances de carrière (avancement d'échelon échu,
-- incohérence d'indice détectée, etc.). Ces alertes sont purement
-- informatives : rien dans ce module ne modifie personnel/carriere_evenements
-- automatiquement, elles servent uniquement à signaler un dossier à traiter par le RH.
BEGIN;

CREATE TABLE IF NOT EXISTS alertes_avancement (
    id                          SERIAL PRIMARY KEY,
    personnel_id                INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    type                        VARCHAR(30) NOT NULL,
    date_echeance_theorique     DATE,
    statut                      VARCHAR(20) NOT NULL DEFAULT 'OUVERTE',
    details                     JSONB,
    evenement_resultant_id      INTEGER REFERENCES carriere_evenements(id) ON DELETE SET NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    traite_at                   TIMESTAMP,
    traite_par                  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT alertes_avancement_type_check CHECK (type IN (
        'AVANCEMENT_ECHELON_ECHU', 'AVANCEMENT_CLASSE_ELIGIBLE', 'INCOHERENCE_INDICE',
        'GRILLE_INCONNUE', 'DOSSIER_INCOMPLET'
    )),
    CONSTRAINT alertes_avancement_statut_check CHECK (statut IN ('OUVERTE', 'TRAITEE', 'IGNOREE'))
);

CREATE INDEX IF NOT EXISTS idx_alertes_avancement_personnel_id ON alertes_avancement(personnel_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_alertes_avancement_ouverte ON alertes_avancement (personnel_id, type) WHERE statut = 'OUVERTE';

COMMIT;
