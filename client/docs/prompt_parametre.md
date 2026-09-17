Tu vas intervenir sur le projet SGRH existant.

## OBJECTIF PRINCIPAL

Enrichir et professionnaliser l'onglet **« Paramètres »** présent dans la sidebar, afin d'en faire un véritable centre de configuration de l'application.

⚠️ **IMPORTANT : cette tâche concerne UNIQUEMENT le frontend.**

Avant toute modification, analyse attentivement l'ensemble du projet frontend afin de comprendre :

* la structure des dossiers ;
* les routes existantes ;
* la sidebar ;
* la top bar ;
* les layouts ;
* les composants réutilisables ;
* le système actuel de rôles et permissions ;
* le système de thème s'il existe ;
* les conventions de design déjà utilisées ;
* les composants UI déjà disponibles ;
* les éventuels hooks ou contextes utilisés pour les préférences ;
* le système de responsive design ;
* les pages déjà existantes liées au profil, à la sécurité ou aux utilisateurs.

**Ne commence aucune modification avant cette analyse.**

---

# 1. CONTRAINTE ABSOLUE : NE PAS MODIFIER LE BACKEND

Ne modifie absolument rien concernant :

* Express ;
* Node.js ;
* PostgreSQL ;
* les tables SQL ;
* les migrations ;
* les contrôleurs backend ;
* les routes API ;
* les middlewares ;
* l'authentification backend ;
* les permissions backend ;
* les modèles backend ;
* les variables `.env` ;
* les requêtes SQL.

Ne crée aucune nouvelle API.

Ne modifie aucune fonctionnalité métier existante.

La tâche doit rester **100 % frontend**.

Si une fonctionnalité nécessiterait normalement le backend, crée uniquement l'interface frontend correspondante avec un comportement visuel/local approprié, sans inventer une API.

---

# 2. NE PAS CASSER L'EXISTANT

Le projet fonctionne déjà.

Tu dois donc :

* conserver toutes les routes existantes ;
* conserver les fonctionnalités existantes ;
* conserver le système d'authentification actuel ;
* conserver le système de rôles actuel ;
* conserver la sidebar actuelle ;
* conserver la top bar actuelle ;
* conserver le footer actuel ;
* conserver les composants existants lorsqu'ils sont réutilisables ;
* ne pas supprimer du code fonctionnel sans raison ;
* ne pas réécrire inutilement l'architecture ;
* ne pas changer les noms des routes existantes ;
* ne pas modifier les appels API existants.

**Le résultat doit être une amélioration du frontend, pas une refonte fonctionnelle du projet.**

---

# 3. STRUCTURE DU NOUVEL ONGLET PARAMÈTRES

Créer une page Paramètres professionnelle, claire et ergonomique.

La structure globale doit être :

## 👤 COMPTE

* Profil et compte
* Sécurité
* Sessions

## 🎨 PRÉFÉRENCES

* Apparence
* Notifications
* Langue & région
* Accessibilité

## 📊 DONNÉES

* Préférences des tableaux
* Documents

## 🏛️ ADMINISTRATION

* Personnel
* Carrière
* Utilisateurs
* Rôles & permissions
* Journal d'activité

## ⚙️ SYSTÈME

* Configuration système
* Fonctionnalités
* Maintenance

### IMPORTANT

**NE PAS créer de section « Établissements ».**

La gestion des établissements ne doit apparaître nulle part dans cette nouvelle interface Paramètres.

---

# 4. AFFICHAGE SELON LE RÔLE

Le frontend doit utiliser le système de rôle/permission déjà présent dans le projet.

Ne crée pas un deuxième système de permissions.

Les catégories doivent être adaptées à l'utilisateur connecté.

### PERSONNEL

Afficher principalement :

* Profil et compte
* Sécurité
* Sessions
* Apparence
* Notifications
* Langue & région
* Accessibilité
* Préférences des tableaux
* Documents

### ADMIN RH

Afficher :

* les paramètres du Personnel ;
* Personnel ;
* Carrière ;
* Utilisateurs ;
* Rôles & permissions ;
* Journal d'activité.

### SUPER ADMIN

Afficher l'ensemble des paramètres autorisés :

* Compte ;
* Préférences ;
* Données ;
* Administration ;
* Système.

Les éléments non autorisés ne doivent pas simplement être désactivés visuellement : ils doivent être masqués selon la logique de permissions déjà présente dans le frontend.

---

# 5. DESIGN DE LA PAGE

Créer une interface moderne correspondant au design général du SGRH.

Utiliser :

* React ;
* Tailwind CSS ;
* les composants existants du projet lorsque possible ;
* les icônes déjà utilisées dans le projet ;
* les couleurs et styles déjà présents.

Ne crée pas un design complètement différent du reste de l'application.

L'objectif est que l'utilisateur ait immédiatement l'impression que cette page appartient au même SGRH.

---

# 6. ORGANISATION DE LA PAGE

Créer une interface avec :

### En-tête

Afficher :

**Paramètres**

Puis une courte description :

**Gérez votre compte, vos préférences et les paramètres de votre espace SGRH.**

### Navigation interne

Créer une navigation claire permettant de passer rapidement entre les différentes catégories.

Selon le design existant, tu peux utiliser :

* une sidebar interne ;
* des onglets ;
* une navigation verticale ;
* ou une combinaison adaptée au responsive.

Ne modifie PAS la sidebar principale de l'application sauf si c'est strictement nécessaire pour accéder correctement à la page Paramètres.

---

# 7. SECTION COMPTE

## Profil et compte

Créer une interface permettant de présenter :

* photo de profil ;
* nom ;
* prénom ;
* matricule ;
* email ;
* téléphone ;
* fonction ;
* statut du compte.

Si ces informations existent déjà dans le frontend, réutiliser les données existantes.

Ne crée pas de fausses données dynamiques.

---

## Sécurité

Interface comprenant :

* changement de mot de passe ;
* mot de passe actuel ;
* nouveau mot de passe ;
* confirmation du nouveau mot de passe ;
* indicateur de robustesse du mot de passe ;
* option pour afficher/masquer le mot de passe.

Si la fonctionnalité backend de changement de mot de passe existe déjà, réutiliser le mécanisme existant.

Sinon, créer uniquement l'interface sans créer de nouvelle API.

---

## Sessions

Créer une interface permettant de visualiser graphiquement :

* appareil ;
* navigateur ;
* localisation générale si déjà disponible ;
* dernière activité ;
* session actuelle.

Ajouter visuellement :

**Session actuelle**

et un bouton :

**Se déconnecter de toutes les autres sessions**

Si le backend nécessaire n'existe pas, le bouton peut rester visuel/non fonctionnel.

---

# 8. SECTION APPARENCE

Créer une vraie interface de personnalisation.

### Thème

* Clair
* Sombre
* Système

### Densité

* Compacte
* Normale
* Confortable

### Taille du texte

* Petit
* Normal
* Grand

### Sidebar

* Toujours ouverte
* Réduite

### Animations

* Activer/désactiver

Lorsque cela est possible uniquement avec le frontend existant, rendre ces préférences réellement fonctionnelles.

Par exemple, le thème peut être stocké localement avec `localStorage` si le projet utilise déjà cette approche.

Ne crée pas de backend pour cela.

---

# 9. NOTIFICATIONS

Créer une interface avec plusieurs préférences :

### Notifications dans l'application

* Nouvelles demandes
* Modification du profil
* Documents disponibles
* Validation d'une demande
* Refus d'une demande
* Messages administratifs
* Alertes importantes

### Notifications email

* Notifications importantes
* Nouvelles demandes
* Documents
* Rappels
* Informations administratives

Utiliser de beaux interrupteurs `toggle`, des descriptions courtes et une hiérarchie visuelle claire.

---

# 10. LANGUE & RÉGION

Créer une interface comprenant :

### Langue

* Français
* English

Préparer visuellement la possibilité d'ajouter ultérieurement d'autres langues, mais **ne pas implémenter un système de traduction complet** si celui-ci n'existe pas déjà.

### Format de date

* `17/09/2026`
* `17 septembre 2026`

### Format horaire

* 24 heures
* 12 heures

---

# 11. ACCESSIBILITÉ

Créer une section permettant de configurer :

* taille du texte ;
* contraste élevé ;
* réduction des animations ;
* mise en évidence des éléments interactifs ;
* options facilitant la navigation au clavier.

Les paramètres réellement applicables uniquement côté frontend peuvent être fonctionnels.

---

# 12. PRÉFÉRENCES DES TABLEAUX

Cette section est particulièrement importante pour l'Admin RH.

Prévoir :

### Nombre de lignes par page

* 10
* 25
* 50
* 100

### Options

* mémoriser les filtres ;
* mémoriser le tri ;
* afficher les colonnes supplémentaires ;
* conserver les préférences d'affichage.

Ne modifier les vrais tableaux existants que si cela peut être fait sans casser leur fonctionnement.

---

# 13. DOCUMENTS

Créer une interface de paramètres concernant les documents RH.

Prévoir visuellement :

* prévisualisation automatique ;
* téléchargement automatique ;
* format préféré ;
* préférences d'affichage ;
* types de documents.

Exemples de types :

* CIN ;
* Diplôme ;
* Contrat ;
* Attestation ;
* Décision ;
* Arrêté ;
* Certificat.

⚠️ Cette partie doit rester cohérente avec les fonctionnalités documentaires déjà présentes dans le projet.

Ne crée aucune nouvelle structure backend.

---

# 14. ADMINISTRATION — PERSONNEL

Pour Admin RH et Super Admin.

Créer une interface permettant de présenter les paramètres liés à :

* types de personnel ;
* catégories ;
* corps ;
* grades ;
* fonctions ;
* statuts.

Ne pas implémenter de nouvelle logique métier.

Il s'agit pour cette étape principalement de créer une interface prête à accueillir les futures fonctionnalités backend.

---

# 15. ADMINISTRATION — CARRIÈRE

Créer une interface professionnelle autour de la gestion de carrière.

Prévoir visuellement :

* corps ;
* grades ;
* échelons ;
* positions ;
* types de nomination ;
* types de mouvement ;
* motifs de changement.

Cette section doit être cohérente avec la future gestion de la situation de carrière du personnel.

Ne créer aucune nouvelle API.

---

# 16. UTILISATEURS

Créer une interface d'administration comprenant :

* liste des utilisateurs ;
* statut ;
* rôle ;
* date de dernière connexion ;
* actions disponibles.

Prévoir visuellement :

* recherche ;
* filtre ;
* tri ;
* pagination ;
* bouton ajouter ;
* bouton modifier ;
* bouton désactiver.

Réutiliser les données/API existantes si elles existent déjà.

Sinon, construire uniquement le frontend.

---

# 17. RÔLES & PERMISSIONS

Créer une interface moderne pour visualiser les rôles et permissions.

Rôles principaux :

* Super Administrateur
* Administrateur RH
* Personnel

Afficher les permissions sous forme de groupes.

Exemple :

### Personnel

* Consulter son profil
* Modifier son profil
* Consulter ses documents

### Administration RH

* Consulter les employés
* Modifier les employés
* Ajouter un employé
* Gérer les documents
* Gérer les carrières

### Super Administration

* Gérer les utilisateurs
* Gérer les rôles
* Gérer les permissions
* Configurer le système

⚠️ Ne crée pas un nouveau moteur RBAC.

Utilise celui qui existe déjà dans le projet.

---

# 18. JOURNAL D'ACTIVITÉ

Créer une interface de type tableau/timeline.

Afficher lorsque les données existent :

* date ;
* utilisateur ;
* action ;
* élément concerné ;
* résultat.

Exemple visuel :

17/09/2026 — Admin RH
Modification d'un personnel

17/09/2026 — Admin RH
Ajout d'un document

17/09/2026 — Super Admin
Création d'un utilisateur

Prévoir :

* recherche ;
* filtres ;
* pagination ;
* filtre par utilisateur ;
* filtre par type d'action.

Ne pas inventer de données backend réelles.

---

# 19. CONFIGURATION SYSTÈME

Réservé au Super Admin.

Prévoir une interface permettant de présenter :

* nom du système ;
* nom de l'université ;
* logo ;
* couleur principale ;
* fuseau horaire ;
* format de date ;
* mode maintenance.

Utiliser les informations déjà présentes dans le projet lorsqu'elles existent.

Ne pas modifier la configuration backend.

---

# 20. FONCTIONNALITÉS

Créer une interface permettant d'afficher les fonctionnalités disponibles :

* Notifications ;
* Historique de carrière ;
* Documents RH ;
* Statistiques ;
* autres fonctionnalités déjà présentes.

Utiliser des switches uniquement pour les fonctionnalités qui peuvent réellement être contrôlées côté frontend.

Pour les autres, présenter simplement l'état actuel sans créer de fausse fonctionnalité.

---

# 21. MAINTENANCE

Créer une interface Super Admin présentant :

* état du système ;
* dernière synchronisation si disponible ;
* version de l'application si disponible ;
* statut des services si déjà disponible ;
* mode maintenance.

Ne crée aucune vérification backend supplémentaire.

---

# 22. RESPONSIVE DESIGN

La page doit être parfaitement responsive.

Desktop :

* navigation claire ;
* contenu centré ;
* largeur confortable ;
* espace suffisant ;
* sidebar/topbar fixes si c'est déjà le comportement global du projet.

Tablet :

* adaptation automatique ;
* réduction des espacements.

Mobile :

* navigation interne adaptée ;
* cartes empilées ;
* tableaux transformés si nécessaire ;
* boutons accessibles ;
* aucun débordement horizontal inutile.

---

# 23. LOADING SKELETON

Ajouter des **loading skeletons** professionnels pour les sections qui affichent des données.

Les skeletons doivent :

* respecter la structure finale des composants ;
* avoir une animation discrète ;
* être cohérents avec le design ;
* éviter les écrans blancs ;
* apparaître uniquement pendant les chargements réels.

Ne pas ajouter de délai artificiel uniquement pour montrer le skeleton.

Si les données sont déjà disponibles instantanément, ne pas créer artificiellement un temps de chargement.

---

# 24. ÉTATS UI À PRÉVOIR

Chaque section doit prévoir si nécessaire :

* état normal ;
* chargement ;
* état vide ;
* erreur ;
* succès ;
* confirmation ;
* désactivation.

Exemple :

```text
Chargement...
[ skeleton ]

Aucune session active supplémentaire.

Une erreur est survenue.
[ Réessayer ]
```

---

# 25. ERGONOMIE

L'objectif n'est pas simplement d'ajouter beaucoup de paramètres.

L'interface doit rester :

* claire ;
* professionnelle ;
* moderne ;
* lisible ;
* rapide à comprendre ;
* accessible à un utilisateur non technique.

Éviter les écrans surchargés.

Utiliser :

* cartes ;
* sections ;
* séparateurs ;
* icônes ;
* titres ;
* descriptions courtes ;
* toggles ;
* selects ;
* boutons d'action ;
* badges.

---

# 26. RÉUTILISATION DES COMPOSANTS

Avant de créer un nouveau composant :

1. rechercher s'il existe déjà un composant similaire ;
2. le réutiliser si possible ;
3. sinon créer un composant générique réutilisable.

Par exemple :

* `SettingsSection`
* `SettingsItem`
* `SettingsToggle`
* `SettingsSelect`
* `SettingsCard`
* `SettingsHeader`
* `SettingsSidebar`
* `Skeleton`

Les noms doivent respecter les conventions déjà utilisées dans le projet.

---

# 27. CODE PROPRE

Respecter strictement :

* architecture actuelle ;
* conventions React ;
* conventions Tailwind ;
* ESLint ;
* composants réutilisables ;
* séparation logique/UI ;
* responsive design.

Éviter :

* code dupliqué ;
* gros composants impossibles à maintenir ;
* styles inline inutiles ;
* valeurs hardcodées lorsqu'elles peuvent être centralisées ;
* nouvelles dépendances sans nécessité.

**Ne pas installer de nouvelle librairie sans vérifier d'abord si une solution équivalente existe déjà dans le projet.**

---

# 28. AVANT DE TERMINER

Après les modifications :

1. vérifier toutes les routes frontend concernées ;
2. vérifier la navigation depuis la sidebar ;
3. vérifier le responsive ;
4. vérifier les rôles ;
5. vérifier que les éléments non autorisés sont correctement masqués ;
6. vérifier les skeletons ;
7. vérifier les états vides ;
8. vérifier les erreurs de console ;
9. exécuter le lint ;
10. exécuter le build frontend.

Corriger uniquement les problèmes causés par cette modification.

---

# 29. RAPPORT FINAL

À la fin, donne-moi un résumé clair comprenant :

### Analyse effectuée

* architecture trouvée ;
* système de navigation ;
* système de rôles ;
* composants réutilisés.

### Modifications

Liste précise des fichiers modifiés.

### Fonctionnalités ajoutées

Liste des nouvelles interfaces de paramètres.

### Backend

Confirmer explicitement :

**Aucune modification backend effectuée.**

### Tests

Indiquer :

* lint ;
* build ;
* éventuelles erreurs restantes.

### Points nécessitant ultérieurement le backend

Lister clairement les fonctionnalités qui sont uniquement préparées côté frontend et qui nécessiteront une implémentation backend plus tard.

---

## RÈGLE FINALE

**Analyse d'abord → planifie → modifie uniquement le frontend → teste → explique les changements.**

Ne touche pas au backend.

Ne touche pas à PostgreSQL.

Ne change aucune fonctionnalité métier existante.

Ne supprime aucune fonctionnalité existante.

Ne crée aucune section « Établissements ».

L'objectif est uniquement de transformer l'onglet **Paramètres** actuel en un centre de paramètres complet, professionnel, ergonomique, responsive et cohérent avec le SGRH existant.
