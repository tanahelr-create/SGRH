# Prompt exécutable — Harmonisation du design

**Contexte** : plateforme RH Université de Mahajanga — React (Vite) + Tailwind CSS v4. Certaines pages ont déjà un design abouti et doivent servir de référence ; d'autres sont restées plus basiques et doivent être alignées dessus. Objectif : cohérence visuelle sur toute l'application, sans changer la logique fonctionnelle.

## Système de design déjà en place (ne pas réinventer, réutiliser)

### Couleurs
Ne jamais coder une couleur en dur (`#02295D` etc.) dans un nouveau composant — utiliser les classes Tailwind existantes, car les couleurs sont dynamiques (modifiables par le Superadmin via `/superadmin/apparence`, stockées en base, injectées comme variables CSS au chargement — voir `client/src/context/ThemeContext.jsx`) :
- `bg-navy` / `text-navy` : bleu marine, couleur principale
- `bg-gold` / `text-gold` : or, accent secondaire (utilisé en mode sombre notamment pour les titres)
- `text-status-pending`, `text-status-approved`, `text-status-rejected` : statuts (en attente / approuvé / refusé)

### Typographie
Police Poppins chargée globalement (`client/index.html` + `--font-sans` dans `client/src/index.css`). Ne jamais spécifier une autre police.

### Mode sombre
Chaque page doit avoir ses classes `dark:` équivalentes. Le pattern standard :
- Fond de carte : `bg-white dark:bg-gray-800`
- Texte principal : `text-navy dark:text-gray-100` (ou `dark:text-gold` pour les titres de section)
- Texte secondaire : `text-gray-500 dark:text-gray-400`
- Bordures : `border-gray-200 dark:border-gray-700`

**Auditer toutes les pages du dossier `client/src/pages/` et vérifier qu'aucune n'a de fond blanc/texte sombre codé en dur sans équivalent `dark:` — actuellement plusieurs pages plus anciennes (ex: `EnvoyerNotification.jsx`, `GestionFonctions.jsx`) n'ont pas été mises à jour avec le mode sombre.**

### Texte modifiable par le Superadmin (`useText`)
Système déjà en place : `client/src/context/TextContext.jsx`, hook `useText(cle, valeurParDefaut, categorie)`. Actuellement converti seulement sur `Login.jsx`. **Étendre progressivement à toutes les pages** — chaque texte statique visible par l'utilisateur (titres, labels de boutons, placeholders, messages d'aide) doit passer par `useText` au lieu d'être écrit en dur dans le JSX. Respecter une convention de nommage de clé cohérente : `<nom_page>.<element>` (ex: `dashboard_pe.titre_bienvenue`, `personnel.bouton_export`).

### Références de style à imiter

**1. Page de connexion (`client/src/pages/Login.jsx`)** — référence pour tout écran d'authentification :
- Layout split-screen (panneau coloré à gauche avec formes géométriques SVG décoratives en dégradé navy, formulaire à droite)
- Champs avec icône à gauche (`lucide-react`), fond `bg-gray-50`, bordure arrondie `rounded-full`
- Bouton principal `rounded-full`, pleine largeur

**2. Dashboard PE/PAT (`client/src/pages/personnel/Dashboard.jsx`)** — référence pour les tableaux de bord :
- Bannière d'accueil en haut avec fond `bg-navy`, formes SVG décoratives en overlay, message de bienvenue personnalisé
- Carte profil avec avatar (initiale), infos clés (matricule, rôle)
- Cartes-raccourcis cliquables (icône + titre + description courte) vers les sections principales
- Section "dernières activités" en bas (liste condensée avec statut coloré)

**3. Page Personnel (`client/src/pages/admin-rh/Personnel.jsx`)** — référence pour les tableaux de données :
- Barre de recherche avec icône, filtres multiples en `<select>` sur une ligne, bouton "Réinitialiser" conditionnel
- Compteur de résultats ("X résultat(s) sur Y")
- Tableau avec en-têtes cliquables pour trier (indicateur ↑/↓), lignes cliquables pour déplier un détail
- Boutons d'action groupés en haut à droite (Export, Import, Ajouter)

**4. Modal (`client/src/components/AjouterEmployeModal.jsx`)** — référence pour toute fenêtre modale : fond semi-transparent `bg-black/40`, carte centrée `rounded-lg shadow-xl`, bouton de fermeture (icône X) en haut à droite, scroll interne si contenu long (`max-h-[90vh] overflow-y-auto`).

## Tâches concrètes

1. **Auditer chaque page de `client/src/pages/admin-rh/` et `client/src/pages/personnel/`** non listée en référence ci-dessus (`EnvoyerNotification.jsx`, `GestionFonctions.jsx`, `Carriere.jsx`, `Historique.jsx`, `ComptesEnAttente.jsx`, `NotificationsPage.jsx`, `Parametres.jsx`, `MaCarriere.jsx`, `ValidationEquipe.jsx`, `MonEquipe.jsx`) et :
   - Compléter les classes `dark:` manquantes
   - Harmoniser les boutons : primaire = `bg-navy text-white rounded-md`, secondaire = `border border-gray-300 text-navy rounded-md`, destructif = `border border-status-rejected text-status-rejected`
   - Harmoniser les inputs : `border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy`, avec équivalent `dark:` (`dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`)

2. **Pages Superadmin** (`Comptes.jsx`, `Permissions.jsx`, `Corbeille.jsx`, `ApparenceSite.jsx`) : vérifier la cohérence entre elles (actuellement construites à des moments différents, styles de tableaux/cartes légèrement différents) — les aligner sur le style de `Comptes.jsx`.

3. **Cohérence des largeurs de page** : certaines pages utilisent `max-w-md`, d'autres `max-w-xl`, `max-w-2xl`, `max-w-3xl`, `max-w-4xl` sans règle claire. Établir une convention :
   - Formulaire simple (1 colonne) : `max-w-md` ou `max-w-xl`
   - Formulaire complexe (grille 2 colonnes) : `max-w-2xl` ou `max-w-3xl`
   - Tableau/liste de données : pas de limite (pleine largeur, comme `Personnel.jsx`)
   Appliquer cette règle partout où elle ne l'est pas déjà.

4. **Icônes** : vérifier que chaque page utilise des icônes `lucide-react` cohérentes avec leur usage ailleurs dans l'app (ex: `Search` pour toute recherche, `Download`/`Upload` pour export/import, `UserPlus` pour ajout de personne) plutôt que d'introduire de nouvelles icônes équivalentes.

5. **Ne pas toucher à la logique métier** (appels API, validations, state management) — uniquement le style JSX (`className`) et l'introduction de `useText` là où c'est pertinent.

## Ordre recommandé

1. Compléter le mode sombre sur toutes les pages listées au point 1 (le plus visible, le plus vite fait)
2. Harmoniser boutons/inputs (points 1 et 3)
3. Convertir les textes clés en `useText` sur les pages les plus visibles (dashboards, login déjà fait, page Register)
4. Aligner les 4 pages Superadmin entre elles