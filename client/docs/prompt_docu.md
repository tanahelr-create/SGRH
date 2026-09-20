Maintenant que tu as terminé l'analyse du projet et identifié précisément les fichiers concernés, passe à l'implémentation du **dossier personnel complet**.

## OBJECTIF PRINCIPAL

Je veux améliorer la page **"Mon profil"** du SGRH afin qu'elle ressemble à un véritable **dossier administratif complet du personnel**.

Le résultat doit être professionnel, clair, moderne et adapté à un système de gestion des ressources humaines universitaire.

IMPORTANT :

Je veux améliorer la présentation et les fonctionnalités directement liées au profil, **sans modifier l'architecture générale du projet ni casser les fonctionnalités existantes**.

---

# ⚠️ CONTRAINTES ABSOLUES

Avant toute modification, garde à l'esprit les règles suivantes :

### NE PAS MODIFIER

* architecture générale du projet ;
* séparation `client` / `server` ;
* système d'authentification ;
* rôles ;
* permissions ;
* logique métier ;
* API existantes ;
* structure PostgreSQL ;
* tables existantes ;
* relations existantes ;
* routes existantes ;
* dashboards ;
* fonctionnalités RH existantes.

Ne crée pas une nouvelle architecture simplement pour cette fonctionnalité.

Ne crée pas une nouvelle API si les données nécessaires peuvent être récupérées avec les mécanismes existants.

Ne modifie pas la base de données sauf si c'est absolument indispensable à la fonctionnalité de photo de profil. Si une modification de la base est réellement nécessaire, explique-la clairement avant de l'effectuer.

---

# 1. DOSSIER PERSONNEL COMPLET

La page "Mon profil" doit être transformée en un véritable **dossier administratif du personnel**.

Je ne veux plus simplement une petite carte avec :

* nom ;
* email ;
* rôle ;
* avatar.

Je veux une page structurée comme un dossier RH complet.

---

# 2. IDENTITÉ DU PERSONNEL

Créer une section clairement identifiable :

## IDENTITÉ

Elle doit afficher, lorsque les données existent :

* photo de profil ;
* matricule ;
* nom ;
* prénom ;
* sexe ;
* date de naissance ;
* lieu de naissance ;
* nationalité ;
* situation familiale ;
* téléphone ;
* email ;
* adresse.

Si une information n'existe pas actuellement dans les données disponibles :

**afficher "Non renseigné".**

IMPORTANT :

Ne jamais inventer de données pour remplir les champs.

---

# 3. INFORMATIONS ADMINISTRATIVES

Créer une section :

## INFORMATIONS ADMINISTRATIVES

Elle peut afficher les informations réellement disponibles concernant :

* matricule ;
* catégorie du personnel ;
* type de personnel ;
* statut ;
* fonction ;
* poste ;
* grade ;
* date de recrutement ;
* date de prise de fonction ;
* ancienneté si elle peut être calculée correctement à partir des données existantes.

Respecte les catégories existantes dans le projet, notamment **PE / PAT**.

Ne change pas la logique actuelle des catégories.

---

# 4. INFORMATIONS PROFESSIONNELLES

Créer une section :

## INFORMATIONS PROFESSIONNELLES

Afficher les informations professionnelles disponibles telles que :

* fonction actuelle ;
* poste ;
* service ;
* catégorie ;
* statut professionnel ;
* responsable hiérarchique si cette donnée existe ;
* autres informations professionnelles déjà présentes dans le système.

Ne crée pas de nouvelles données fictives.

---

# 5. PARCOURS PROFESSIONNEL

Créer une section :

## PARCOURS PROFESSIONNEL

Si les données existent dans le système, présenter :

* date de recrutement ;
* évolution professionnelle ;
* changements de fonction ;
* postes occupés ;
* informations de carrière disponibles.

Si l'historique de carrière n'existe pas actuellement dans la base :

NE PAS créer une nouvelle table simplement pour cette tâche.

Présente uniquement les informations réellement disponibles.

---

# 7. PHOTO DE PROFIL — UPLOAD

Je veux également que le personnel puisse **téléverser une photo de profil**.

La photo doit être intégrée directement dans le dossier personnel.

Exemple :

┌─────────────────────┐
│                     │
│       PHOTO         │
│                     │
│      👤             │
│                     │
└─────────────────────┘

Avec une action du type :

**Modifier la photo**

ou

**Téléverser une photo**

---

# 8. COMPORTEMENT DE L'UPLOAD

Lorsque l'utilisateur clique sur "Modifier la photo" :

1. ouvrir le sélecteur de fichiers ;
2. permettre de sélectionner une image depuis l'ordinateur/téléphone ;
3. afficher un aperçu de la photo sélectionnée ;
4. permettre de confirmer l'image ;
5. enregistrer la photo en utilisant l'architecture actuelle du projet.

Si le projet possède déjà un système de stockage/upload :

→ réutilise-le.

Si une API d'upload existe déjà :

→ réutilise-la.

Ne crée pas un deuxième système d'upload inutile.

---

# 9. SÉCURITÉ DE L'UPLOAD

Le système doit accepter uniquement des fichiers image raisonnables.

Prévoir au minimum :

* JPG/JPEG ;
* PNG ;
* éventuellement WebP si le projet le permet.

Refuser les fichiers qui ne sont pas des images.

Prévoir une taille maximale raisonnable.

Ne jamais faire confiance uniquement à l'extension du fichier.

Si le backend actuel possède déjà des règles d'upload :

→ respecte-les.

---

# 10. APERÇU DE LA PHOTO

Avant validation, l'utilisateur doit pouvoir voir l'image sélectionnée.

Exemple :

```text
        ┌─────────────┐
        │             │
        │   APERÇU    │
        │             │
        └─────────────┘

      [Annuler] [Enregistrer]
```

Après validation, la nouvelle photo doit apparaître dans le dossier.

Si aucune photo n'est disponible :

→ afficher un avatar par défaut propre.

---

# 11. SIDEBAR FIXE

La Sidebar doit désormais rester **fixe**.

Lorsqu'on fait défiler la page du dossier personnel :

**la Sidebar ne doit pas défiler avec le contenu.**

Structure souhaitée :

```text
┌────────────────┬────────────────────────────────────────────┐
│                │ TOPBAR FIXE                                │
│                ├────────────────────────────────────────────┤
│ SIDEBAR FIXE   │                                            │
│                │        CONTENU DU DOSSIER                  │
│                │                                            │
│                │        ↓ défile uniquement ici             │
│                │                                            │
│                │        ↓                                    │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

La Sidebar doit occuper toute la hauteur disponible.

Le contenu principal doit pouvoir défiler indépendamment.

IMPORTANT :

Ne casse pas le comportement responsive existant de la Sidebar.

Sur mobile, conserve le comportement mobile actuellement prévu par le projet.

---

# 12. TOPBAR FIXE

La TopBar/Header doit également rester **fixe**.

Lorsqu'on fait défiler le dossier personnel :

* la TopBar reste visible ;
* elle ne disparaît pas ;
* elle ne défile pas avec le contenu.

Le défilement doit uniquement concerner la zone centrale du contenu.

Structure :

```text
┌─────────────────────────────────────────────────────────────┐
│                    TOPBAR FIXE                              │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│ SIDEBAR FIXE  │       CONTENU QUI DÉFILE                   │
│               │                                             │
│               │       ↓                                     │
│               │       ↓                                     │
│               │       ↓                                     │
└───────────────┴─────────────────────────────────────────────┘
```

---

# 13. IMPORTANT : ÉVITER LE DOUBLE SCROLL

Je veux une gestion propre du défilement.

Évite d'avoir :

* un scroll de toute la page ;
* puis un autre scroll dans une partie du dossier ;
* puis éventuellement un troisième scroll dans la Sidebar.

L'objectif est d'avoir une structure claire :

**Sidebar fixe + TopBar fixe + zone centrale scrollable.**

Analyse le layout actuel avant de modifier les propriétés CSS/Tailwind.

Ne casse pas les composants existants.

---

# 14. DESIGN DU DOSSIER

Le dossier doit avoir une apparence de **document RH professionnel**.

Structure générale :

```text
┌─────────────────────────────────────────────────────────────┐
│                  DOSSIER DU PERSONNEL                       │
│                                                             │
│  ┌──────────┐   NOM PRÉNOM                                  │
│  │          │   Matricule : XXXXX                           │
│  │  PHOTO   │   Fonction : XXXXX                            │
│  │          │   Catégorie : PE / PAT                        │
│  └──────────┘                                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ IDENTITÉ                                                     │
│                                                             │
│ Nom                  Prénom                                 │
│ Date de naissance    Lieu de naissance                      │
│ Sexe                 Nationalité                             │
│ Situation familiale  Téléphone                               │
│ Email                Adresse                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ INFORMATIONS ADMINISTRATIVES                                 │
│                                                             │
│ Matricule          Statut                                   │
│ Catégorie          Fonction                                 │
│ Poste              Grade                                    │
│ Date recrutement   Date prise de fonction                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ INFORMATIONS PROFESSIONNELLES                                │
│                                                             │
│ Fonction actuelle                                            │
│ Poste                                                        │
│ Service                                                      │
│ Statut professionnel                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ PARCOURS PROFESSIONNEL                                       │
│                                                             │
│ Informations disponibles sur la carrière                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 15. IDENTITÉ VISUELLE

Le design doit rester cohérent avec le SGRH actuel.

Utilise :

* Tailwind CSS ;
* les couleurs déjà utilisées ;
* les composants existants ;
* les icônes déjà installées ;
* les styles existants lorsque possible.

Le résultat doit être :

* professionnel ;
* moderne ;
* aéré ;
* lisible ;
* administratif ;
* responsive.

Ne transforme pas toute l'application visuellement.

---

# 16. ACCESSIBILITÉ

Les boutons doivent être clairement identifiables.

Le bouton de changement de photo doit avoir un texte ou un label accessible.

Les champs doivent avoir une bonne lisibilité.

Les contrastes doivent rester corrects.

Le menu utilisateur doit rester utilisable au clavier lorsque cela est compatible avec l'architecture existante.

---

# 17. DONNÉES

Toutes les données du dossier doivent correspondre au **personnel actuellement connecté**.

Ne mets aucune donnée statique.

Ne mets aucune donnée fictive.

Ne fais aucune supposition sur le personnel.

Lorsqu'une donnée manque :

**Non renseigné**

---

# 18. NE PAS CRÉER DE FONCTIONNALITÉS INUTILES

Cette tâche n'a pas pour objectif de créer :

* un nouveau système RH ;
* un nouveau système d'authentification ;
* un nouveau système de permissions ;
* une nouvelle base de données ;
* une nouvelle API complète ;
* un nouveau dashboard.

Il s'agit d'améliorer **le dossier personnel existant**.

---

# 19. CONSERVATION DES ROUTES

La route actuelle permettant d'accéder au profil doit continuer à fonctionner.

Le lien **"Mon profil"** du menu utilisateur doit pointer vers la page existante du profil.

Ne crée pas une nouvelle route si ce n'est pas nécessaire.

---

# 20. MODIFICATION CIBLÉE

Ne profite pas de cette tâche pour refaire :

* la Sidebar entière ;
* tous les dashboards ;
* toutes les pages ;
* les tableaux ;
* les formulaires RH ;
* le backend.

Modifie uniquement les composants nécessaires au :

1. dossier personnel ;
2. profil utilisateur ;
3. upload de photo ;
4. layout nécessaire pour Sidebar fixe ;
5. TopBar fixe ;
6. navigation vers le profil si nécessaire.

---

# 21. VÉRIFICATIONS

Après les modifications, lance les vérifications disponibles.

### Frontend

* build ;
* ESLint ;
* tests éventuels.

### Navigation

Vérifie :

* ouverture du profil ;
* retour aux autres pages ;
* Sidebar ;
* TopBar ;
* menu utilisateur ;
* déconnexion.

### Dossier

Vérifie :

* affichage des informations ;
* sections ;
* affichage "Non renseigné" ;
* photo par défaut ;
* upload ;
* aperçu ;
* sauvegarde de la photo.

### Scroll

Vérifie impérativement :

* Sidebar fixe ;
* TopBar fixe ;
* contenu central scrollable ;
* absence de double scroll inutile ;
* comportement mobile.

---

# 22. RAPPORT FINAL

À la fin, donne-moi un rapport clair.

## Fichiers modifiés

Liste exactement tous les fichiers modifiés.

## Fonctionnalités ajoutées/améliorées

Explique :

* nouveau dossier personnel ;
* upload de photo ;
* aperçu photo ;
* menu profil ;
* Sidebar fixe ;
* TopBar fixe.

## Fonctionnalités conservées

Confirme que :

* authentification ;
* rôles ;
* permissions ;
* API ;
* base de données ;
* fonctionnalités RH ;
* routes existantes

ont été conservés.

## Tests

Indique :

* Build : OK / ERREUR
* ESLint : OK / ERREUR / NON DISPONIBLE
* Tests : OK / ERREUR / NON DISPONIBLES

## Upload

Indique comment l'upload de photo a été implémenté et s'il utilise une infrastructure existante.

## Problèmes éventuels

Signale clairement toute limitation ou donnée manquante.

---

# RÈGLE FINALE ABSOLUE

Le principe de cette modification est :

**NE PAS REFAIRE LE PROJET.**

Je veux :

**Même architecture**
+
**Même backend**
+
**Même base de données**
+
**Même authentification**
+
**Mêmes fonctionnalités**
+
**Même navigation**

mais avec :

**un dossier personnel complet et professionnel**
+
**une photo de profil téléchargeable**
+
**une Sidebar fixe**
+
**une TopBar fixe**
+
**une zone centrale indépendante et scrollable.**

Avant de considérer la tâche terminée, vérifie réellement que le projet compile et que les fonctionnalités existantes fonctionnent toujours.
