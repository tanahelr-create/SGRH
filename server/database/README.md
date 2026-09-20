o# Base de données — `server/database/`

| Fichier | Rôle |
| --- | --- |
| `schema.sql` | Schéma complet (33 tables, contraintes, index, vue `user_details`). **Base vide uniquement.** |
| `seed_reference.sql` | Données de référence sans donnée personnelle : rôles, permissions, catégories, types de situation, grille indiciaire vérifiée, paramètres de carrière, textes/couleurs du site, directions et services. Idempotent. |
| `seed_dev.sql` | Données **fictives** de développement (noms « DEMO », e-mails `@example.test`, matricules `1000xx`). Mot de passe de tous les comptes : `Demo1234!`. |
| `MCD.md` | Modèle conceptuel, diagramme Mermaid, écarts connus. |

```bash
createdb -U rh_admin -h localhost ma_base_dev            # base vide (jamais la base de production)
psql -U rh_admin -h localhost -d ma_base_dev -f server/database/schema.sql
psql -U rh_admin -h localhost -d ma_base_dev -f server/database/seed_reference.sql
psql -U rh_admin -h localhost -d ma_base_dev -f server/database/seed_dev.sql   # développement uniquement
```

Ne jamais exécuter `schema.sql` sur une base existante : utiliser les migrations `server/migrations/`.
