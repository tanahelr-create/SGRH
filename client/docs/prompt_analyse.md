Tu travailles sur mon projet SGRH (Système de Gestion des Ressources Humaines) situé dans ce dépôt GitHub :

https://github.com/tanahelr-create/SGRH.git

## OBJECTIF PRINCIPAL

Je souhaite modifier principalement l'interface utilisateur concernant l'emplacement du profil utilisateur.

Actuellement, les informations/actions liées au profil utilisateur se trouvent dans la Sidebar.

Je souhaite adopter une interface plus moderne et professionnelle :

* supprimer l'affichage du profil utilisateur depuis la Sidebar ;
* placer l'accès au profil dans la partie supérieure droite de l'interface, dans la TopBar/Header ;
* utiliser une petite icône utilisateur/avatar à droite ;
* au clic sur cette icône, afficher un menu déroulant (dropdown) contenant les informations et actions actuellement disponibles pour le profil ;
* conserver toutes les fonctionnalités existantes ;
* ne modifier ni le fonctionnement métier, ni l'authentification, ni la base de données, ni les API, sauf si une modification est absolument nécessaire pour préserver le fonctionnement de l'interface.

---

# PHASE 1 — ANALYSE OBLIGATOIRE DU PROJET

IMPORTANT :

NE MODIFIE AUCUN FICHIER pendant cette première phase.

Commence par analyser le projet de manière complète afin de comprendre son architecture réelle.

Inspecte notamment :

### Frontend

* structure du dossier `client/`
* fichiers React
* composants
* layouts
* Sidebar
* Header / Navbar / TopBar
* routes
* pages
* contexte d'authentification
* gestion de l'utilisateur connecté
* composants réutilisables
* fichiers Tailwind/CSS
* hooks
* services/API
* gestion des rôles
* responsive design

### Backend

Analyse également suffisamment le dossier `server/` pour t'assurer que la modification de l'interface ne casse aucune dépendance avec :

* authentification
* utilisateur connecté
* rôles
* sessions/token
* API utilisateur
* routes backend

Ne modifie cependant pas le backend si cela n'est pas nécessaire.

### Recherche spécifique

Cherche précisément :

* où le profil utilisateur est actuellement affiché ;
* quel composant contient l'affichage du nom/prénom/avatar ;
* quel composant contient les actions du profil ;
* où se trouve la Sidebar ;
* où se trouve la Navbar/Header/TopBar ;
* comment la Sidebar et le Header sont assemblés dans le layout ;
* comment les informations de l'utilisateur connecté sont récupérées ;
* comment fonctionne actuellement la déconnexion ;
* comment fonctionnent les éventuelles actions "Profil", "Paramètres", etc. ;
* quels fichiers CSS/Tailwind contrôlent ces éléments ;
* quelles pages utilisent ces composants.

Ne suppose jamais le nom ou l'emplacement d'un fichier : vérifie réellement le code du projet.

---

# PHASE 2 — RAPPORT D'ANALYSE

Une fois l'analyse terminée, AVANT toute modification, présente-moi un rapport clair contenant :

## 1. Architecture concernée

Indique les fichiers et composants qui interviennent dans :

* Sidebar
* Header/TopBar/Navbar
* profil utilisateur
* authentification
* déconnexion
* layout principal

## 2. Fichiers qui devront être modifiés

Donne la liste exacte des fichiers qui devront être modifiés.

Pour chaque fichier, explique brièvement :

* son rôle actuel ;
* pourquoi il doit être modifié ;
* quelle modification tu prévois.

## 3. Fichiers qui ne doivent PAS être modifiés

Indique les parties du projet qui doivent rester intactes, notamment :

* backend ;
* base de données ;
* API ;
* logique métier ;
* authentification ;

si elles ne sont pas concernées.

## 4. Plan de modification

Présente ensuite un plan étape par étape.

Exemple :

1. Modifier le layout principal.
2. Retirer le bloc profil de la Sidebar.
3. Ajouter l'icône utilisateur dans la TopBar.
4. Créer/adapter le dropdown.
5. Réutiliser la logique de déconnexion existante.
6. Adapter le responsive.
7. Vérifier les routes.
8. Lancer les tests/build.

IMPORTANT :

À ce stade, NE MODIFIE TOUJOURS AUCUN FICHIER.

---

# PHASE 3 — VÉRIFICATION DU PLAN

Avant de commencer les modifications, vérifie que ton plan respecte ces contraintes :

* aucune fonctionnalité existante ne doit être supprimée ;
* aucune route existante ne doit être cassée ;
* aucune modification inutile du backend ;
* aucune modification de la base PostgreSQL ;
* aucune modification de l'authentification si elle n'est pas nécessaire ;
* aucune duplication inutile de code ;
* réutiliser les composants existants lorsque cela est pertinent ;
* conserver Tailwind CSS ;
* conserver le style général actuel du projet ;
* améliorer l'ergonomie et l'aspect professionnel.

Si tu identifies un risque, signale-le avant de modifier.

---

# PHASE 4 — MODIFICATION

Après avoir terminé l'analyse et identifié précisément les fichiers concernés, applique les modifications.

## Résultat visuel souhaité

Je veux obtenir une structure similaire à :

┌──────────────────────────────────────────────────────────────┐
│ Logo / titre                         🔔    👤 Utilisateur ▾  │
├────────────────┬─────────────────────────────────────────────┤
│                │                                             │
│ 🏠 Dashboard   │                                             │
│ 👥 Employés    │                  Contenu                    │
│ 🏢 ...         │                                             │
│ 📊 ...         │                                             │
│                │                                             │
└────────────────┴─────────────────────────────────────────────┘

Le profil ne doit donc plus être placé en bas de la Sidebar.

L'icône utilisateur doit être placée dans la partie supérieure droite de la TopBar/Header.

---

# DROPDOWN DU PROFIL

Lorsque l'utilisateur clique sur l'icône/avatar :

┌────────────────────────────┐
│ Nom Prénom                 │
│ Rôle de l'utilisateur      │
├────────────────────────────┤
│ 👤 Mon profil              │
│ ⚙️ Paramètres              │
├────────────────────────────┤
│ 🚪 Déconnexion             │
└────────────────────────────┘

IMPORTANT :

Ne crée pas artificiellement des fonctionnalités qui n'existent pas.

Si "Paramètres" ou "Mon profil" existe déjà, réutilise leur route/action actuelle.

Si une fonctionnalité n'existe pas actuellement, ne l'invente pas simplement pour remplir le menu.

La déconnexion doit utiliser exactement la logique existante du projet.

---

# DESIGN

Le résultat doit être professionnel, moderne et ergonomique.

Utilise Tailwind CSS conformément au système déjà utilisé dans le projet.

Le dropdown doit :

* être correctement aligné avec l'icône ;
* avoir une largeur raisonnable ;
* avoir une bonne hiérarchie visuelle ;
* avoir des espacements cohérents ;
* avoir des états hover/focus ;
* être accessible au clavier autant que possible ;
* se fermer lorsqu'on clique à l'extérieur ;
* se fermer après sélection d'une action lorsque cela est approprié ;
* ne pas dépasser l'écran sur mobile.

L'icône utilisateur doit rester facilement identifiable.

Ne surcharge pas visuellement l'interface.

---

# RESPONSIVE DESIGN

Vérifie particulièrement :

* desktop ;
* tablette ;
* mobile.

Sur petit écran, le dropdown doit rester entièrement visible et ne pas sortir de l'écran.

La Sidebar existante doit continuer à fonctionner normalement.

---

# CONTRAINTE IMPORTANTE : PRÉSERVER LES FONCTIONNALITÉS

Cette modification est principalement une modification UI/UX.

Ne change pas :

* logique métier ;
* structure PostgreSQL ;
* endpoints API ;
* système d'authentification ;
* rôles ;
* permissions ;
* routes existantes ;
* logique des dashboards ;

sauf nécessité absolue.

Si tu dois modifier une de ces parties, explique précisément pourquoi.

---

# QUALITÉ DU CODE

Pendant la modification :

* privilégie les composants réutilisables ;
* évite la duplication ;
* respecte l'architecture déjà présente ;
* respecte les conventions de nommage du projet ;
* ne crée pas de dépendance npm inutile ;
* n'installe aucune librairie supplémentaire sans raison ;
* réutilise les icônes/librairies déjà présentes dans le projet ;
* ne remplace pas complètement une architecture existante simplement pour cette modification.

Si un composant Header/TopBar existe déjà, adapte-le plutôt que d'en créer un deuxième inutile.

Si un composant Dropdown existe déjà et peut être réutilisé, utilise-le.

---

# PHASE 5 — VÉRIFICATIONS APRÈS MODIFICATION

Une fois les modifications terminées :

1. vérifie les imports ;
2. vérifie les chemins ;
3. vérifie les routes ;
4. vérifie les erreurs React ;
5. vérifie les erreurs TypeScript/ESLint s'il y en a ;
6. lance le build frontend ;
7. vérifie que le projet compile correctement ;
8. vérifie que le menu profil fonctionne ;
9. vérifie la déconnexion ;
10. vérifie que la Sidebar fonctionne toujours ;
11. vérifie que les autres pages utilisant le layout ne sont pas cassées.

Si le projet possède des tests, exécute-les.

Ne considère pas la tâche terminée simplement parce que le code a été modifié : vérifie réellement que le projet fonctionne.

---

# PHASE 6 — RAPPORT FINAL

À la fin, donne-moi un rapport comprenant :

### Modifications effectuées

Liste les fichiers réellement modifiés.

Pour chacun, explique ce qui a changé.

### Fonctionnement

Explique :

* où se trouve maintenant le profil ;
* comment ouvrir le menu ;
* comment fonctionne la déconnexion ;
* comment le responsive a été géré.

### Vérifications

Indique clairement :

* build : OK/ERREUR ;
* tests : OK/ERREUR/NON DISPONIBLES ;
* lint : OK/ERREUR/NON DISPONIBLE.

### Fichiers non touchés

Confirme que le backend, la base de données et l'authentification n'ont pas été modifiés si ce n'était pas nécessaire.

### Problèmes éventuels

Si quelque chose n'a pas pu être vérifié ou présente un risque, indique-le clairement.

---

# RÈGLE ABSOLUE

L'ordre de travail doit être :

ANALYSER
↓
IDENTIFIER LES FICHIERS
↓
PRÉSENTER LE PLAN
↓
VÉRIFIER LES RISQUES
↓
MODIFIER
↓
TESTER
↓
RAPPORTER

Ne saute pas directement à la modification.

Je veux d'abord que tu comprennes réellement l'architecture existante du projet avant de toucher au code.
