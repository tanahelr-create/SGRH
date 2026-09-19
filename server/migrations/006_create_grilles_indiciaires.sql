-- Grilles indiciaires réglementaires (mission "grilles indiciaires & carrière").
-- Chaque ligne d'indice cite son texte source : rien n'est inventé, toute
-- combinaison classe/échelon non couverte par une ligne active reste
-- "à confirmer" côté application plutôt que d'être devinée.
BEGIN;

CREATE TABLE IF NOT EXISTS grilles_indiciaires (
    id                      SERIAL PRIMARY KEY,
    code                    VARCHAR(60) NOT NULL,
    nom                     VARCHAR(200) NOT NULL,
    regime                  VARCHAR(30) NOT NULL,
    description             TEXT,
    texte_source_principal  VARCHAR(255) NOT NULL,
    date_debut_validite     DATE NOT NULL,
    date_fin_validite       DATE,
    actif                   BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    CONSTRAINT grilles_indiciaires_code_key UNIQUE (code),
    CONSTRAINT grilles_indiciaires_regime_check CHECK (regime IN ('FONCTIONNAIRE', 'AGENT_NON_ENCADRE', 'AUTRE')),
    CONSTRAINT grilles_indiciaires_dates_check CHECK (date_fin_validite IS NULL OR date_fin_validite >= date_debut_validite)
);

CREATE TABLE IF NOT EXISTS lignes_grille_indiciaire (
    id                      SERIAL PRIMARY KEY,
    grille_id               INTEGER NOT NULL REFERENCES grilles_indiciaires(id) ON DELETE CASCADE,
    cadre                   VARCHAR(5),
    echelle                 VARCHAR(5),
    categorie               VARCHAR(10),
    corps                   VARCHAR(50),
    classe                  VARCHAR(30) NOT NULL,
    echelon                 INTEGER NOT NULL,
    indice                  INTEGER NOT NULL,
    code_grille_affichage   VARCHAR(20),
    source_texte            VARCHAR(255) NOT NULL,
    source_article          VARCHAR(150),
    date_debut_validite     DATE NOT NULL,
    date_fin_validite       DATE,
    actif                   BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    CONSTRAINT lignes_grille_cadre_check CHECK (cadre IS NULL OR cadre IN ('A', 'B', 'C', 'D')),
    CONSTRAINT lignes_grille_classe_check CHECK (classe IN ('CLASSE_EXCEPTIONNELLE', 'PRINCIPALAT', 'PREMIERE_CLASSE', 'DEUXIEME_CLASSE')),
    CONSTRAINT lignes_grille_indice_check CHECK (indice > 0),
    CONSTRAINT lignes_grille_dates_check CHECK (date_fin_validite IS NULL OR date_fin_validite >= date_debut_validite),
    -- Loi n°2003-011, Art.46 : classe exceptionnelle = 2 échelons, les 3 autres classes = 3 échelons.
    -- Empêche en base une combinaison classe/échelon qui n'existe pas réglementairement (§15/§41).
    CONSTRAINT lignes_grille_echelon_par_classe_check CHECK (
        (classe = 'CLASSE_EXCEPTIONNELLE' AND echelon BETWEEN 1 AND 2) OR
        (classe IN ('PRINCIPALAT', 'PREMIERE_CLASSE', 'DEUXIEME_CLASSE') AND echelon BETWEEN 1 AND 3)
    )
);

CREATE INDEX IF NOT EXISTS idx_lignes_grille_cadre_echelle ON lignes_grille_indiciaire (grille_id, cadre, echelle, classe, echelon);
CREATE INDEX IF NOT EXISTS idx_lignes_grille_categorie ON lignes_grille_indiciaire (grille_id, categorie, classe, echelon);

-- Seule donnée chiffrée vérifiée à ce jour (voir README, section "Grilles indiciaires") :
-- Décret n°97-009 du 16/01/1997 + Circulaire n°132/MFPTLS du 01/06/2005 (régime transitoire
-- par "catégorie" I à X, classe exceptionnelle uniquement — le décret de classement
-- hiérarchique cadre/échelle et la grille indiciaire complète prévus par la Loi n°2003-011
-- n'ont pas été localisés). Le principalat, la première classe et la deuxième classe
-- restent volontairement sans ligne : à compléter dès qu'un texte fiable ou une
-- confirmation RH sera disponible, jamais par une valeur inventée.
INSERT INTO grilles_indiciaires (code, nom, regime, description, texte_source_principal, date_debut_validite)
VALUES (
    'FONCTIONNAIRE_CLASSE_EXC_TRANSITOIRE',
    'Classe exceptionnelle — régime transitoire par catégorie (I à X)',
    'FONCTIONNAIRE',
    'Régime transitoire appliqué en attendant le décret de classement hiérarchique cadre/échelle et la grille indiciaire complète prévus par la Loi n°2003-011 (non localisés lors de cette recherche). Ne couvre que la classe exceptionnelle (1er et 2e échelon), par catégorie I à X.',
    'Décret n°97-009 du 16/01/1997, complété par la Circulaire n°132/MFPTLS du 01/06/2005',
    '2005-06-01'
);

-- 1er échelon : catégories I à X (515, 675, 1020, 1550, 1600, 1750, 1850, 2225, 2325, 2520)
-- 2e échelon  : catégories I à X (675, 1020, 1550, 1600, 1750, 1850, 2225, 2325, 2520, 2620)
INSERT INTO lignes_grille_indiciaire (grille_id, categorie, classe, echelon, indice, source_texte, source_article, date_debut_validite)
SELECT g.id, v.categorie, 'CLASSE_EXCEPTIONNELLE', v.echelon, v.indice,
       'Décret n°97-009 du 16/01/1997 ; Circulaire n°132/MFPTLS du 01/06/2005', 'Art.2 (décret) / tableau (circulaire)', '2005-06-01'
FROM grilles_indiciaires g
CROSS JOIN (VALUES
    ('I', 1, 515),   ('II', 1, 675),   ('III', 1, 1020), ('IV', 1, 1550), ('V', 1, 1600),
    ('VI', 1, 1750), ('VII', 1, 1850), ('VIII', 1, 2225), ('IX', 1, 2325), ('X', 1, 2520),
    ('I', 2, 675),   ('II', 2, 1020),  ('III', 2, 1550), ('IV', 2, 1600), ('V', 2, 1750),
    ('VI', 2, 1850), ('VII', 2, 2225), ('VIII', 2, 2325), ('IX', 2, 2520), ('X', 2, 2620)
) AS v(categorie, echelon, indice)
WHERE g.code = 'FONCTIONNAIRE_CLASSE_EXC_TRANSITOIRE';

COMMIT;
