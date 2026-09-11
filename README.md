# SGRH — Système de Gestion des Ressources Humaines

Application de gestion des ressources humaines de l'Université de Mahajanga.

## Structure

- `client/` : application React, Vite et Tailwind CSS.
- `server/` : API Node.js, Express et PostgreSQL.

## Installation locale

1. Créez `client/.env` à partir de `client/.env.example`.
2. Créez `server/.env` à partir de `server/.env.example`.
3. Installez les dépendances dans chaque dossier : `npm ci`.
4. Démarrez les services selon les scripts disponibles dans leurs `package.json`.

Les fichiers `.env` ne sont jamais versionnés. Ne mettez pas de secrets dans le code ou dans les fichiers de configuration suivis par Git.

## Vérification continue

Chaque push et pull request vers `main` exécute GitHub Actions : installation des dépendances, build du frontend et vérification syntaxique du backend. Aucun déploiement n'est configuré tant qu'un hébergeur compatible avec Express et PostgreSQL n'a pas été choisi.
