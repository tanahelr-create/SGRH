# Prompt exécutable — Nouvelles fonctionnalités

**Contexte du projet** : plateforme RH Université de Mahajanga — React (Vite) + Node/Express + PostgreSQL (SQL brut, pas d'ORM). Architecture en couches : `routes → controllers → services → repositories → DB`. Système de permissions dynamique déjà en place (table `permissions` / `role_permissions`, middleware `requirePermission`). Toute nouvelle route protégée doit utiliser `requirePermission('cle')`, pas `requireRole` en dur.

Chaque tâche ci-dessous doit être traitée dans l'ordre : **DB → backend (repository → service → controller → routes) → frontend**, avec test manuel avant de passer à la tâche suivante.

---

## Tâche 1 — Recherche du personnel à inviter (par nom ou matricule)

**Objectif** : dans la page "Inviter un personnel" (`client/src/pages/admin-rh/Invitations.jsx`), remplacer ou compléter le menu déroulant actuel par un champ de recherche filtrant en direct sur `nom`, `prenom` et `matricule`.

- Backend : aucune nouvelle route nécessaire — le filtrage peut se faire côté frontend sur les données déjà renvoyées par `GET /api/personnel/sans-compte`.
- Frontend :
  - Ajouter un `<input type="text">` de recherche au-dessus du select existant (ou remplacer le select par une liste filtrée cliquable).
  - Filtrer la liste `personnel` en mémoire : `nom`, `prenom`, `matricule` doivent matcher la saisie (insensible à la casse, recherche partielle).
  - Si aucun résultat : afficher "Aucun employé trouvé pour cette recherche."

**Nouvelle permission à ajouter au catalogue** : aucune (réutilise `send_registration_link`).

---

## Tâche 2 — Superadmin : personnalisation du thème (couleurs/design du site)

**Objectif** : le Superadmin peut modifier les couleurs de l'application (actuellement codées en dur dans `client/src/index.css` via `@theme`) depuis une interface, avec effet immédiat pour tous les utilisateurs.

### Base de données
```sql
CREATE TABLE site_settings (
    key VARCHAR(50) PRIMARY KEY,
    value VARCHAR(20) NOT NULL
);

INSERT INTO site_settings (key, value) VALUES
('color_navy', '#02295D'),
('color_gold', '#F2B705'),
('color_status_pending', '#B8860B'),
('color_status_approved', '#2F6F4E'),
('color_status_rejected', '#B23A3A');
```

### Backend
- `repositories/siteSettingsRepository.js` : `getAll()`, `updateOne(key, value)`.
- `services/siteSettingsService.js` : validation basique (format hexadécimal `^#[0-9A-Fa-f]{6}$`).
- `controllers/siteSettingsController.js` : `GET /api/site-settings` (public, pas d'auth — nécessaire pour appliquer le thème dès le login), `PATCH /api/site-settings` (protégé par nouvelle permission `manage_site_settings`, Superadmin uniquement).
- Route montée dans `app.js` sous `/api/site-settings`.
- Ajouter la permission `manage_site_settings` (catégorie "Superadmin") au catalogue `permissions`, activée par défaut pour `SUPERADMIN`.

### Frontend
- **Ne plus utiliser `@theme` fixe en CSS** pour ces couleurs. À la place :
  - Au chargement de l'app (`App.jsx` ou un nouveau `ThemeSettingsProvider`), appeler `GET /api/site-settings` et injecter les valeurs comme variables CSS sur `:root` via `document.documentElement.style.setProperty('--color-navy', value)`, etc.
  - Garder les mêmes noms de variables (`--color-navy`, `--color-gold`, ...) pour que toutes les classes Tailwind existantes (`bg-navy`, `text-gold`...) continuent de fonctionner sans rien changer d'autre.
- Nouvelle page `client/src/pages/superadmin/ApparenceSite.jsx` :
  - Un color picker (`<input type="color">`) par variable, avec aperçu en direct (appliquer immédiatement en local avant sauvegarde, ou après clic "Enregistrer" — au choix, mais préciser lequel).
  - Bouton "Enregistrer" → `PATCH /api/site-settings` pour chaque couleur modifiée.
  - Bouton "Réinitialiser aux couleurs par défaut" (bleu marine/or d'origine).
- Ajouter l'entrée "Apparence du site" au menu Superadmin (`menuConfig.js`), route `/superadmin/apparence`, permission `manage_site_settings`.

---

## Tâche 3 — Corbeille Superadmin (comptes et éléments supprimés)

**Objectif** : au lieu de supprimer définitivement (actuellement `DELETE FROM users` dans `accountAdminController.remove`), déplacer l'élément dans une "corbeille" consultable et restaurable par le Superadmin.

### Base de données
```sql
CREATE TABLE corbeille (
    id SERIAL PRIMARY KEY,
    type_element VARCHAR(30) NOT NULL,       -- ex: 'compte', 'personnel'
    donnees JSONB NOT NULL,                  -- snapshot complet de la ligne supprimée
    supprime_par INTEGER REFERENCES users(id),
    supprime_le TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Backend
- Modifier `accountAdminController.remove` (et tout futur endpoint de suppression, ex: personnel plus tard) :
  au lieu de `DELETE FROM users`, faire :
  1. Récupérer la ligne complète (`SELECT * FROM users WHERE id = $1`)
  2. L'insérer dans `corbeille` (`type_element = 'compte'`, `donnees = <la ligne en JSON>`)
  3. Supprimer la ligne originale
- `repositories/corbeilleRepository.js` : `add(typeElement, donnees, supprimePar)`, `listAll()`, `findById(id)`, `removeFromCorbeille(id)` (suppression définitive depuis la corbeille).
- `controllers/corbeilleController.js` :
  - `GET /api/corbeille` (liste tout, Superadmin)
  - `POST /api/corbeille/:id/restaurer` : réinsère les `donnees` dans la table d'origine (`users` si `type_element = 'compte'`), puis retire l'entrée de `corbeille`
  - `DELETE /api/corbeille/:id` (suppression définitive, irréversible)
- Nouvelle permission `manage_corbeille` (catégorie "Superadmin"), Superadmin uniquement.
- Route montée dans `app.js` sous `/api/corbeille`.

### Frontend
- Nouvelle page `client/src/pages/superadmin/Corbeille.jsx` :
  - Liste des éléments supprimés (type, aperçu des données, qui a supprimé, quand)
  - Bouton "Restaurer" par ligne
  - Bouton "Supprimer définitivement" (avec confirmation, comme déjà fait pour les comptes)
- Ajouter l'entrée "Corbeille" au menu Superadmin, route `/superadmin/corbeille`, permission `manage_corbeille`.

**Attention** : la restauration d'un compte doit vérifier qu'aucun autre compte n'a été créé depuis avec le même `personnel_id` ou `email`, sinon conflit de contrainte `UNIQUE`.

---

## Tâche 4 — Import/Export Excel + déplacement du formulaire "Ajouter un employé"

### 4a. Déplacement de "Ajouter un employé"

- Le formulaire actuellement sur sa propre page (`client/src/pages/admin-rh/AjouterEmploye.jsx`, route `/admin/ajouter-employe`) doit être intégré **dans** la page `Personnel.jsx`, par exemple sous forme de panneau/modal déclenché par un bouton "+ Ajouter un employé" en haut du tableau.
- Retirer l'entrée de menu séparée "Ajouter un employé" dans `menuConfig.js`.
- Retirer la route `/admin/ajouter-employe` dans `App.jsx` (ou la garder en redirection vers `/admin/personnel` si des liens externes existent déjà).
- Après création réussie, rafraîchir la liste du tableau `Personnel.jsx` sans recharger toute la page.

### 4b. Export Excel

- Backend : `GET /api/personnel/export` (permission `view_personnel`) : construit un fichier `.xlsx` à partir de `SELECT * FROM personnel`, en utilisant la librairie `exceljs` (`npm install exceljs` côté `server/`). Répond avec les headers appropriés (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename=personnel.xlsx`).
- Frontend : bouton "Exporter en Excel" sur `Personnel.jsx`, déclenche un téléchargement du fichier (fetch + `blob()` + création d'un lien `<a>` temporaire).

### 4c. Import Excel

- Backend : `POST /api/personnel/import` (permission `create_personnel`), multipart/form-data avec un fichier `.xlsx`. Utiliser `multer` (déjà courant, `npm install multer`) pour recevoir le fichier, puis `exceljs` pour le lire.
  - Colonnes attendues (à faire correspondre exactement à la structure de `personnel`) : `matricule, nom, prenom, email, role, fonction, corps, grade, service, direction, telephone, type_contrat`.
  - Pour chaque ligne : valider (matricule = 6 chiffres, role ∈ {PE, PAT}, email présent) puis `INSERT` (ignorer/logguer les lignes en erreur, ne pas bloquer tout l'import pour une seule ligne fautive).
  - Réponse : résumé `{ inserted: N, errors: [{ line, reason }] }`.
- Frontend : bouton "Importer un fichier Excel" sur `Personnel.jsx`, `<input type="file" accept=".xlsx">`, envoi en `FormData`, affichage du résumé (nombre importés, erreurs éventuelles avec leur ligne).

---

## Ordre de priorité recommandé

1. Tâche 1 (rapide, aucun risque)
2. Tâche 4a (déplacement, simplifie l'UI avant d'ajouter import/export dessus)
3. Tâche 4b puis 4c (export avant import, plus simple à tester)
4. Tâche 3 (corbeille — sécurité/traçabilité)
5. Tâche 2 (thème dynamique — la plus transverse, à faire en dernier pour ne pas perturber le reste du développement visuel)
