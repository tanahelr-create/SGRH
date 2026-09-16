-- Ajoute uniquement la référence du fichier de photo de profil.
-- À exécuter une fois sur la base PostgreSQL existante avant d'utiliser l'upload.
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS photo_profil TEXT;
