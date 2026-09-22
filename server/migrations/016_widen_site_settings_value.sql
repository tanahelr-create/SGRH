-- site_settings.value ne stockait que des couleurs hexadécimales (#RRGGBB, 7 caractères) ;
-- la personnalisation ajoute des chemins de fichier (logo, favicon), ex.
-- "/uploads/site/<uuid>.png", plus longs que les 20 caractères actuels. Élargissement
-- simple, sans perte pour les valeurs existantes (toutes bien en-deçà de 255).
ALTER TABLE site_settings ALTER COLUMN value TYPE VARCHAR(255);
