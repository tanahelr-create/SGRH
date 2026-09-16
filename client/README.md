# Client SGRH

Interface React 19/Vite du Système de Gestion des Ressources Humaines. Le style repose sur Tailwind CSS 4 et les icônes sur `lucide-react`.

## Démarrage

Créez `client/.env` à partir de `.env.example`, puis configurez `VITE_API_URL` (par défaut : `http://localhost:4000/api`).

```bash
npm ci
npm run dev
```

Scripts disponibles : `npm run dev`, `npm run build`, `npm run preview` et `npm run lint`.

## Organisation

- `src/App.jsx` : routes publiques et protégées ;
- `src/context` : authentification, permissions, thème et textes ;
- `src/components/layout` : shell partagé (sidebar, topbar, pied de page) ;
- `src/config/menuConfig.js` : navigation filtrée par rôle et permission ;
- `src/pages` : espaces Admin RH, Superadmin et Personnel ;
- `src/services` : appels HTTP vers l'API.

Les pages authentifiées utilisent `AppShell`. La Sidebar contient la navigation métier. Sur écran large, le shell garde Sidebar et TopBar visibles et réserve le défilement à la zone de contenu. Le menu utilisateur de la TopBar rassemble l'avatar, le nom, le rôle, les paramètres, le lien « Mon profil » lorsqu'il est autorisé pour `PE`/`PAT`, et la déconnexion. Cette dernière passe par `AuthContext.logout()` et retire le jeton `rh_token` du stockage local.

La page `/profil` affiche le dossier personnel de l'utilisateur connecté (identité, données administratives et professionnelles, puis parcours de carrière). Les valeurs absentes sont explicitement indiquées comme « Non renseigné » et aucune information d'établissement n'y apparaît. La photo de profil est sélectionnée et prévisualisée côté client avant l'envoi multipart vers `PATCH /api/personnel/me/photo`; les formats JPG, PNG et WebP sont limités à 3 Mo.
