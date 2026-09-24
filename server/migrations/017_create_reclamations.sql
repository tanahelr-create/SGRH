-- Réclamations du personnel (PE/PAT) adressées au Superadmin en cas de problème
-- rencontré dans l'application — distinct de `notifications` (annonces RH -> personnel,
-- sans notion de statut/réponse) : ici l'auteur décrit un problème, le Superadmin y
-- répond et le marque traité.
CREATE TABLE reclamations (
  id           SERIAL PRIMARY KEY,
  auteur_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sujet        VARCHAR(150) NOT NULL,
  description  TEXT NOT NULL,
  statut       VARCHAR(20) NOT NULL DEFAULT 'ouverte' CHECK (statut IN ('ouverte', 'traitee')),
  reponse      TEXT,
  traite_par   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  traite_le    TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_reclamations_statut ON reclamations (statut, created_at DESC);
