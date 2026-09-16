# MISSION

Tu interviens sur un projet existant nommé **SGRH — Système de Gestion des Ressources Humaines**.

Le projet est une application web avec un frontend React/Vite utilisant Tailwind CSS et un backend Node.js/Express avec PostgreSQL.

Ta mission est de modifier l'interface utilisateur concernant **l'accès au profil utilisateur**, tout en préservant intégralement le fonctionnement actuel de l'application.

IMPORTANT : tu dois travailler comme un développeur intervenant sur un projet existant.

Tu ne dois pas supposer la structure du projet.

Tu dois d'abord inspecter et comprendre le code réellement présent dans le workspace.

---

# 1. ANALYSE BLACK BOX OBLIGATOIRE

Commence par analyser automatiquement le projet.

Explore notamment :

* structure des dossiers ;
* frontend ;
* backend ;
* composants React ;
* layouts ;
* Sidebar ;
* Header / Navbar / TopBar ;
* système de routing ;
* authentification ;
* récupération des informations de l'utilisateur connecté ;
* gestion des rôles ;
* logique de déconnexion ;
* composants UI réutilisables ;
* Tailwind CSS ;
* éventuels composants Dropdown ;
* éventuelles librairies d'icônes.

Recherche dans tout le code les éléments liés à :

* profil utilisateur ;
* nom/prénom ;
* avatar ;
* rôle ;
* déconnexion ;
* paramètres ;
* compte utilisateur ;
* Sidebar ;
* Header ;
* Navbar ;
* TopBar.

Ne crée aucun nouveau composant avant d'avoir vérifié si un composant existant peut être réutilisé.

---

# 2. IDENTIFIER LE FONCTIONNEMENT ACTUEL

Comprends précisément :

1. où le profil est actuellement affiché ;
2. quelles informations sont affichées ;
3. quelles actions sont disponibles ;
4. comment fonctionne la déconnexion ;
5. comment l'utilisateur connecté est récupéré ;
6. quel layout englobe les pages ;
7. quelles pages utilisent la Sidebar ;
8. quelles pages utilisent le Header/TopBar ;
9. si plusieurs interfaces existent selon le rôle de l'utilisateur.

Le projet peut comporter plusieurs espaces utilisateur.

Ne fais donc aucune modification globale qui pourrait casser les interfaces des différents rôles.

---

# 3. MODIFICATION DEMANDÉE

Je veux déplacer l'accès au profil utilisateur.

## AVANT

Le profil utilisateur est actuellement présent dans la Sidebar.

Je ne veux plus que le bloc profil soit affiché dans la Sidebar.

## APRÈS

L'accès au profil doit être placé dans la partie supérieure droite de l'interface, dans le Header / TopBar existant.

La structure recherchée est approximativement :

┌──────────────────────────────────────────────────────────────┐
│ Logo / titre                         🔔     👤 Utilisateur ▾ │
├────────────────┬─────────────────────────────────────────────┤
│                │                                             │
│ 🏠 Accueil     │                                             │
│ 👥 Employés    │                  CONTENU                    │
│ 📊 ...         │                                             │
│ 📄 ...         │                                             │
│                │                                             │
└────────────────┴─────────────────────────────────────────────┘

L'icône/avatar utilisateur doit être située à droite de la TopBar.

---

# 4. MENU DROPDOWN

Lorsque l'utilisateur clique sur l'avatar/icône utilisateur, afficher un dropdown moderne.

Exemple :

┌──────────────────────────────┐
│ Nom Prénom                   │
│ Rôle                         │
├──────────────────────────────┤
│ 👤 Mon profil                │
│ ⚙️ Paramètres                │
├──────────────────────────────┤
│ 🚪 Déconnexion               │
└──────────────────────────────┘

Mais attention :

**Ne crée pas de fonctionnalités fictives.**

Si le projet possède déjà une route ou une action correspondant au profil, aux paramètres ou à la déconnexion, réutilise exactement cette logique.

Si une action n'existe pas actuellement, ne crée pas arbitrairement une nouvelle fonctionnalité uniquement pour remplir le menu.

---

# 5. DÉCONNEXION

La déconnexion est particulièrement importante.

Ne réimplémente pas un nouveau système de logout.

Recherche la logique existante et réutilise-la.

La modification de l'interface ne doit pas changer :

* token ;
* session ;
* localStorage ;
* cookies ;
* contexte d'authentification ;
* permissions ;
* rôles ;
* redirection après déconnexion.

Le bouton "Déconnexion" du nouveau dropdown doit déclencher **la même fonction de déconnexion qui existait auparavant**.

---

# 6. DESIGN

Le résultat doit avoir une apparence professionnelle et moderne.

Utilise le système de design déjà présent dans le projet.

Utilise **Tailwind CSS** si c'est bien le système actuellement utilisé.

Ne remplace pas Tailwind par une autre solution.

Le dropdown doit :

* être propre ;
* être suffisamment compact ;
* être bien aligné sous l'avatar ;
* avoir une bonne hiérarchie visuelle ;
* avoir des espacements cohérents ;
* avoir des états hover ;
* avoir un état focus ;
* avoir des bordures/rayons cohérents avec le design existant ;
* avoir une ombre légère si cohérente avec le design ;
* être visible au-dessus du contenu ;
* ne pas être coupé par la Sidebar ou un conteneur ;
* ne pas provoquer de décalage de la page.

Évite les effets visuels excessifs.

---

# 7. COMPORTEMENT DU DROPDOWN

Le dropdown doit avoir un comportement professionnel.

Il doit :

* s'ouvrir au clic sur l'avatar ;
* se fermer lorsque l'utilisateur clique à l'extérieur ;
* se fermer lorsque l'utilisateur sélectionne une action ;
* pouvoir être fermé avec `Escape` lorsque cela est pertinent ;
* fonctionner correctement avec le clavier autant que possible ;
* ne pas rester bloqué ouvert ;
* ne pas ouvrir plusieurs menus simultanément ;
* ne pas provoquer de problème de scroll.

Si le projet possède déjà un système Dropdown réutilisable, utilise-le.

N'ajoute pas de dépendance externe si ce n'est pas nécessaire.

---

# 8. AVATAR / ICÔNE

Utilise en priorité les composants/icônes déjà présents dans le projet.

Si le projet utilise déjà une bibliothèque d'icônes, réutilise-la.

Ne crée pas inutilement une nouvelle dépendance.

L'avatar peut afficher :

* l'image de profil si elle existe ;
* sinon une icône utilisateur ;
* éventuellement les initiales si cette logique est cohérente avec le projet.

Ne modifie pas le système de stockage des photos de profil si celui-ci existe déjà.

---

# 9. SIDEBAR

Supprime uniquement la partie liée au profil utilisateur de la Sidebar.

Ne supprime pas :

* navigation ;
* menus ;
* liens ;
* logo ;
* bouton de fermeture ;
* responsive ;
* informations nécessaires au fonctionnement de la Sidebar.

La Sidebar doit conserver exactement son rôle actuel.

---

# 10. TOPBAR / HEADER

Si un Header/TopBar existe déjà :

**adapte-le.**

Ne crée pas un deuxième Header inutile.

Place l'avatar utilisateur dans la partie droite du Header.

Respecte :

* hauteur actuelle ;
* largeur ;
* espacement ;
* responsive ;
* design général ;
* navigation existante.

Si plusieurs layouts existent pour différents rôles, analyse-les avant de décider s'il faut appliquer le changement à tous ou seulement à certains.

---

# 11. RESPONSIVE

La modification doit fonctionner sur :

### Desktop

Sidebar + TopBar + contenu.

### Tablette

La disposition doit rester propre.

### Mobile

L'avatar doit rester accessible.

Le dropdown doit rester entièrement visible.

Il ne doit pas sortir de l'écran horizontalement.

La Sidebar mobile doit continuer à fonctionner.

---

# 12. PRÉSERVATION ABSOLUE DU FONCTIONNEMENT

Cette tâche est principalement une modification **UI/UX**.

Ne modifie pas inutilement :

* backend ;
* PostgreSQL ;
* schéma de base de données ;
* endpoints ;
* authentification ;
* autorisations ;
* logique métier ;
* API ;
* routes ;
* gestion des employés ;
* gestion des établissements ;
* dashboards ;
* invitations ;
* rôles.

Si une modification de l'un de ces éléments devient réellement nécessaire, arrête-toi avant de la faire et explique pourquoi.

---

# 13. QUALITÉ DU CODE

Respecte l'architecture existante.

Avant de créer quelque chose :

1. recherche si cela existe déjà ;
2. vérifie si le composant peut être réutilisé ;
3. vérifie si une fonction existe déjà ;
4. évite la duplication ;
5. évite les fichiers inutiles.

Ne transforme pas tout le projet pour une petite modification d'interface.

Ne fais pas de refactoring massif non demandé.

Ne modifie pas des fichiers sans rapport avec cette tâche.

---

# 14. VÉRIFICATION APRÈS MODIFICATION

Après avoir effectué les changements :

### Vérifie les imports

Aucun import inutilisé ou cassé.

### Vérifie React

Aucune erreur de rendu.

### Vérifie Tailwind

Les classes doivent être correctement interprétées.

### Vérifie le build

Lance le build frontend disponible dans le projet.

### Vérifie le lint

S'il existe un système de lint, exécute-le.

### Vérifie les routes

Toutes les routes précédentes doivent fonctionner.

### Vérifie l'authentification

Le changement du profil ne doit pas casser l'utilisateur connecté.

### Vérifie le logout

Le bouton de déconnexion doit utiliser la logique existante.

---

# 15. RÈGLE CONTRE LES MODIFICATIONS INUTILES

Ne profite pas de cette tâche pour :

* refaire entièrement la Sidebar ;
* refaire tout le Header ;
* modifier les couleurs globales ;
* changer le backend ;
* changer PostgreSQL ;
* modifier les routes ;
* installer plusieurs packages ;
* réorganiser tout le projet ;
* modifier des pages qui ne sont pas concernées.

Je demande une modification ciblée et propre.

Tu peux cependant effectuer de petites améliorations CSS nécessaires pour que le nouveau système soit réellement professionnel et cohérent.

---

# 16. RAPPORT FINAL

Une fois terminé, donne un résumé clair comprenant :

## Fichiers modifiés

Liste tous les fichiers réellement modifiés.

Pour chaque fichier :

* nom ;
* rôle ;
* modification effectuée.

## Fonctionnement

Explique :

* où se trouve maintenant le profil ;
* comment ouvrir le dropdown ;
* quelles informations sont affichées ;
* comment fonctionne la déconnexion.

## Vérifications

Indique :

* Build : OK / ÉCHEC
* Lint : OK / ÉCHEC / NON DISPONIBLE
* Tests : OK / ÉCHEC / NON DISPONIBLES

## Backend

Indique explicitement si le backend a été laissé intact.

## Base de données

Indique explicitement si PostgreSQL et le schéma de base de données ont été laissés intacts.

## Problèmes éventuels

Signale honnêtement tout problème rencontré.

---

# RÈGLE FINALE

Travaille en mode **BLACK BOX**.

Tu dois découvrir toi-même :

* l'architecture ;
* les fichiers ;
* les composants ;
* les fonctions ;
* les routes ;
* les dépendances ;
* le système d'authentification.

Ne demande pas à l'utilisateur de te donner les noms des fichiers si tu peux les découvrir en inspectant le workspace.

Ne suppose jamais qu'un fichier existe.

Ne réécris jamais une fonctionnalité existante avant d'avoir recherché son implémentation.

**Comprendre → localiser → modifier uniquement ce qui est nécessaire → tester → rapporter.**

La priorité absolue est :

**préserver les fonctionnalités existantes tout en améliorant proprement l'interface du profil utilisateur.**
