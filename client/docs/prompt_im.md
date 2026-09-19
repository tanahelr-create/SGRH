Tu vas maintenant prendre en charge la **finalisation complète du SGRH de l'Université de Mahajanga**.

Le projet est déjà avancé. **Ne recommence rien depuis zéro et ne remplace pas l'architecture existante sans raison.**

Ton objectif est :

> **ANALYSER → COMPRENDRE → IMPLÉMENTER → TESTER → DÉTECTER LES BUGS → CORRIGER → RETESTER → VALIDER**

Tu dois travailler de manière autonome autant que possible.

---

# 1. AVANT TOUT : AUDIT COMPLET

Avant toute modification, analyse entièrement le projet.

Inspecte notamment :

* `client/`
* `server/`
* routes frontend ;
* composants ;
* services/API ;
* contrôleurs backend ;
* middlewares ;
* authentification ;
* autorisations ;
* modèles/requêtes SQL ;
* migrations ;
* configuration PostgreSQL ;
* système de fichiers/uploads ;
* notifications ;
* génération PDF ;
* gestion des employés ;
* carrière ;
* comptes utilisateurs ;
* contrats déjà implémentés ;
* paramètres ;
* sidebar ;
* README/documentation.

Ne modifie rien pendant cette première phase d'analyse.

Identifie :

1. ce qui existe déjà ;
2. ce qui fonctionne ;
3. ce qui est incomplet ;
4. les bugs ;
5. les doublons ;
6. les incohérences frontend/backend/DB ;
7. les fonctionnalités déjà implémentées qu'il faut réutiliser.

**Ne crée jamais un deuxième système lorsqu'un système équivalent existe déjà.**

---

# 2. BASE DE DONNÉES RÉELLE

La base PostgreSQL locale utilisée par le projet est :

* Host : `localhost`
* Database : `rh_mahajanga`
* User : `rh_admin`
* Port : `5432`

Connexion connue :

```bash
psql -U rh_admin -d rh_mahajanga -h localhost
```

Tu es autorisé à inspecter et modifier cette base.

La base réelle `rh_mahajanga` est la **source de vérité**.

Tu dois vérifier directement :

* tables ;
* colonnes ;
* types ;
* contraintes ;
* clés primaires ;
* clés étrangères ;
* index ;
* relations ;
* données existantes ;
* éventuelles migrations.

Ne suppose jamais que le schéma correspond à une ancienne version du projet.

### Tu peux effectuer directement les modifications normales :

* créer une table ;
* ajouter une colonne ;
* créer un index ;
* créer une relation ;
* créer une contrainte ;
* créer une migration ;
* ajouter des données de référence ;
* corriger une incohérence de schéma.

### DEMANDE-MOI CONFIRMATION uniquement avant :

* suppression d'une table ;
* suppression d'une colonne contenant potentiellement des données ;
* suppression massive ;
* migration destructive ;
* modification pouvant provoquer une perte de données ;
* changement structurel majeur présentant un risque important.

Dans ce cas, explique-moi :

* ce qui doit être changé ;
* pourquoi ;
* impact ;
* données concernées ;
* migration prévue ;
* méthode de protection des données.

Puis attends ma confirmation.

INTERDICTION ABSOLUE :

```sql
DROP DATABASE
DROP SCHEMA
TRUNCATE
```

ou toute suppression massive destinée uniquement à faciliter les tests.

---

# 3. CONTRATS — FONCTIONNALITÉ PRINCIPALE À FINALISER

Le système doit gérer correctement le cycle de vie des contrats.

Architecture logique souhaitée :

```text
EMPLOYEE
   ↓
CONTRACT
   ↓
CONTRACT_DOCUMENT
   ↓
PDF
```

Adapte cette architecture au schéma existant au lieu de créer inutilement des tables en double.

## Historique

Un personnel peut avoir plusieurs contrats au cours de sa carrière.

Exemple :

```text
Jean Racoute
 ├── Contrat 2010
 ├── Contrat 2012
 ├── Contrat 2014
 ├── Contrat 2016
 └── Contrat actuel
```

Tous les anciens contrats doivent rester accessibles.

**Ne jamais écraser un ancien contrat.**

Chaque contrat doit conserver son propre document PDF lorsqu'il existe.

Le personnel doit pouvoir voir uniquement ses propres contrats.

RH doit pouvoir voir l'ensemble des contrats des personnels auxquels il a accès.

---

# 4. CONTRAT ACTUEL

Le contrat actuel doit être déterminé à partir des données structurées :

* date début ;
* date fin ;
* statut ;
* type ;
* règles métier existantes.

Ne crée pas un champ manuel redondant du type `is_current` si cela n'est pas nécessaire.

Évite les situations où deux contrats seraient simultanément considérés comme actuels.

Si une nouvelle logique est nécessaire, garantis l'intégrité au niveau backend et/ou DB.

---

# 5. ELD

Pour les ELD, respecte le moteur de calcul déjà présent dans le projet.

La règle métier connue est une progression par paliers de deux ans :

```text
+10 %
+20 %
+30 %
+40 %
...
```

Ne crée surtout pas un deuxième moteur de calcul.

Analyse d'abord le code/configuration existant pour déterminer :

* le point de départ ;
* les intervalles ;
* le calcul ;
* les éventuelles limites ;
* les conditions particulières.

**N'invente pas de plafond si le code/documentation existant ne le définit pas.**

Si une règle existante est déjà correctement implémentée, conserve-la et intègre-la au nouveau système de contrats.

---

# 6. EFA

Analyse les règles EFA déjà présentes dans le projet et/ou la documentation.

Les catégories professionnelles concernées sont :

* Catégorie 1 : Sous-opérateur — CEPE
* Catégorie 2 : Opérateur — BEPC
* Catégorie 3 : Encadreur — BAC
* Catégorie 4 : Technicien supérieur — DTS
* Catégorie 5 : Réalisateur adjoint — Licence
* Catégorie 6 : Réalisateur — Maîtrise
* Catégorie 8 : Concepteur — DA ou Master+

La catégorie 7 n'existe pas dans cette classification.

Pour les EFA, ne choisis pas arbitrairement entre les différentes règles discutées précédemment.

**Inspecte le code, la base et la documentation existante avant de décider.**

S'il existe une contradiction réelle entre plusieurs sources, signale-la avant d'inventer une nouvelle règle.

---

# 7. AVENANTS

Un avenant doit avoir sa propre date d'effet.

IMPORTANT :

> La notification six mois avant la fin du contrat n'est PAS la date d'effet d'un avenant.

La date d'effet doit être celle indiquée dans l'acte/avenant enregistré par RH.

Conserve l'historique des avenants.

---

# 8. PDF — ARCHIVE DOCUMENTAIRE UNIQUEMENT

Le PDF sert de document justificatif/archive.

NE FAIS PAS :

* OCR ;
* extraction automatique de texte ;
* reconnaissance automatique du type ;
* extraction de dates ;
* extraction de catégorie ;
* extraction d'indice ;
* extraction de grade ;
* extraction de classe ;
* extraction de situation administrative ;
* déduction de données de carrière depuis le PDF.

Les données métier sont saisies/validées dans les champs structurés du SGRH.

Le PDF est simplement associé au contrat correspondant.

---

# 9. STOCKAGE DES PDF

Inspecte d'abord le système de stockage existant.

Réutilise-le si possible.

Les documents privés ne doivent pas être exposés publiquement.

Si nécessaire, utilise un stockage privé de type :

```text
private-uploads/
```

et ajoute-le au `.gitignore`.

Ne committe jamais les documents PDF privés.

---

# 10. NOTIFICATIONS AUTOMATIQUES

Implémente/finalise le système automatique de notification.

Six mois avant la date de fin d'un contrat :

```text
Système
   ↓
détecte l'échéance
   ↓
notification RH
   ↓
notification au personnel concerné
```

La notification doit contenir les informations utiles, notamment :

* personnel concerné ;
* date de fin ;
* contrat concerné ;
* action nécessaire.

Le personnel ne doit recevoir que ses propres notifications.

RH doit pouvoir identifier immédiatement le personnel concerné.

### IMPORTANT

La notification ne décide jamais automatiquement du renouvellement.

Elle sert uniquement à alerter.

Évite les notifications en double pour le même événement.

Si un système de notifications existe déjà, réutilise-le.

---

# 11. RENOUVELLEMENT

Lorsque RH reçoit l'alerte, RH doit pouvoir choisir :

### Option 1 — Renouveler avec renégociation

Cette action signifie uniquement :

> le renouvellement est en discussion.

Elle ne doit PAS créer automatiquement le nouveau contrat.

La négociation se fait entre RH et le personnel.

Après accord, RH enregistre le nouveau contrat structuré et son PDF.

### Option 2 — Ne pas renouveler

Cette action doit obligatoirement demander un motif/message.

Un champ vide ou contenant uniquement des espaces doit être refusé.

Le personnel doit recevoir exactement le motif enregistré par RH.

L'ancien contrat reste dans l'historique.

---

# 12. HISTORIQUE DES CONTRATS — INTERFACE RH

Depuis la fiche existante d'un personnel :

```text
Personnel
   ↓
Profil
   ↓
Contrats
```

Afficher :

### Contrat actuel

Avec notamment :

* type ;
* date début ;
* date fin ;
* statut ;
* document ;
* avenants éventuels.

### Historique

Afficher les anciens contrats avec leurs informations et documents.

Ne crée pas une nouvelle fiche personnel uniquement pour les contrats.

Utilise la fiche personnel existante.

---

# 13. INTERFACE PERSONNEL

Le personnel doit uniquement accéder à :

* ses propres contrats ;
* ses propres documents ;
* ses propres notifications.

Il ne doit jamais pouvoir consulter les contrats ou documents d'un autre personnel en modifiant simplement un ID dans l'URL ou une requête API.

La protection doit être faite côté backend, pas seulement dans React.

---

# 14. CARRIÈRE

La carrière reste indépendante des PDF.

Les informations comme :

* catégorie ;
* corps ;
* grade ;
* classe ;
* indice ;
* fonction ;
* situation administrative ;

doivent continuer à être gérées par les données structurées et les règles métier existantes.

Ne déduis jamais ces informations d'un document PDF.

Préserve le système de calcul existant.

---

# 15. ANCIENNETÉ

Vérifie le calcul d'ancienneté existant.

Lorsqu'il dépend des contrats historiques, il doit utiliser les données historiques disponibles sans écraser les anciennes périodes.

Teste notamment :

* un seul contrat ;
* plusieurs contrats successifs ;
* contrats avec renouvellements ;
* périodes historiques ;
* contrat actuel.

---

# 16. BUG — SUPPRESSION DES COMPTES

Il existe actuellement un problème lors de la suppression d'un compte.

Ne masque surtout pas l'erreur avec un simple `catch`.

Cherche la cause réelle.

Analyse :

```text
Frontend
 ↓
API
 ↓
Controller
 ↓
Service
 ↓
SQL
 ↓
PostgreSQL
 ↓
FK / contraintes / dépendances
```

Détermine si le problème vient de :

* FK ;
* dépendance ;
* mauvais ID ;
* mauvais endpoint ;
* permission ;
* logique de suppression ;
* statut ;
* transaction ;
* requête SQL ;
* incohérence frontend/backend.

Corrige proprement la cause.

Ne supprime pas une contrainte importante simplement pour faire disparaître l'erreur.

Teste au minimum :

* suppression autorisée ;
* compte inexistant ;
* compte déjà inactif/supprimé ;
* utilisateur non autorisé ;
* compte ayant des dépendances ;
* erreur SQL ;
* réponse API ;
* affichage frontend.

---

# 17. BUG — CERTIFICAT ADMINISTRATIF

Il existe également un problème où un certificat administratif peut afficher les informations d'un mauvais personnel.

Audite toute la chaîne :

```text
ID sélectionné dans React
        ↓
requête API
        ↓
backend
        ↓
requête SQL
        ↓
résultat PostgreSQL
        ↓
génération PDF
        ↓
document final
```

Vérifie particulièrement :

* `employeeId` ;
* paramètres d'URL ;
* paramètres POST/GET ;
* requêtes SQL ;
* mapping des résultats ;
* données par défaut ;
* données hardcodées ;
* template PDF ;
* cache ;
* état React ;
* mauvais objet sélectionné.

Test obligatoire :

Créer/générer un certificat pour plusieurs personnels différents, notamment Jean Racoute si ce personnel existe dans la base, et vérifier que chaque certificat contient uniquement les données du personnel sélectionné.

---

# 18. PERMISSIONS

Audit complet des permissions.

Vérifie que :

* RH peut effectuer les opérations RH autorisées ;
* personnel ne peut accéder qu'à ses propres données ;
* les API sont protégées ;
* les permissions ne reposent pas uniquement sur l'interface ;
* les routes directes sont sécurisées ;
* les documents privés sont protégés.

Réutilise les permissions existantes lorsqu'elles correspondent au besoin.

Ne crée pas de doublons inutiles.

---

# 19. SIDEBAR

Audit de la sidebar actuelle.

Elle contient actuellement trop d'éléments.

Objectif :

* réduire la surcharge ;
* regrouper les fonctionnalités logiquement ;
* supprimer les doublons ;
* placer les notifications de façon simple ;
* garder uniquement les éléments utiles pour chaque rôle ;
* conserver les fonctionnalités existantes.

Ne supprime jamais une fonctionnalité métier simplement parce qu'elle est retirée de la sidebar : elle doit seulement être mieux organisée ou accessible ailleurs si nécessaire.

---

# 20. RESPONSIVE

Le frontend doit fonctionner correctement sur :

* grand écran ;
* ordinateur portable ;
* tablette ;
* mobile.

La sidebar doit pouvoir être rétractée sur mobile.

Vérifie notamment :

* tableaux ;
* formulaires ;
* profils ;
* contrats ;
* notifications ;
* modales ;
* navbar ;
* dashboards ;
* boutons ;
* PDF/document sections.

Ne casse aucune fonctionnalité existante.

---

# 21. LOADING / SKELETON

Si le système de loading skeleton existe déjà, réutilise-le.

Sinon, ajoute-le uniquement aux endroits nécessaires :

* listes ;
* profils ;
* contrats ;
* notifications ;
* dashboards ;
* données chargées depuis API.

Le skeleton doit être lié au véritable état de chargement.

Ne mets pas un délai artificiel uniquement pour donner l'impression d'un chargement.

---

# 22. VALIDATION

Toutes les données sensibles doivent être validées côté backend.

Vérifie notamment :

* dates ;
* identifiants ;
* contrats ;
* fichiers ;
* motifs ;
* permissions ;
* données obligatoires.

Les validations frontend peuvent améliorer l'UX mais ne remplacent jamais les validations backend.

---

# 23. TRANSACTIONS

Lorsqu'une opération implique plusieurs modifications liées, utilise une transaction PostgreSQL lorsque nécessaire.

Par exemple :

```text
création contrat
+
association document
+
mise à jour état associé
```

Tout doit être cohérent.

Si une étape échoue, évite de laisser la base dans un état partiellement modifié.

---

# 24. COMPATIBILITÉ AVEC LES DONNÉES EXISTANTES

Tu dois préserver les données déjà présentes dans `rh_mahajanga`.

Ne reconstruis pas inutilement la base.

Ne réinitialise pas la base pour faire fonctionner le nouveau système.

Si une migration est nécessaire :

* fais-la proprement ;
* documente-la ;
* teste-la ;
* vérifie les données après migration.

---

# 25. TESTS OBLIGATOIRES

Après implémentation, effectue des tests réels.

### Contrats

Tester :

* création ;
* modification ;
* historique ;
* contrat actuel ;
* ancien contrat ;
* avenant ;
* PDF ;
* renouvellement ;
* non-renouvellement.

### Notifications

Tester :

* échéance ;
* notification RH ;
* notification personnel ;
* absence de doublon ;
* mauvais utilisateur ;
* renouvellement ;
* non-renouvellement.

### Comptes

Tester :

* création ;
* connexion ;
* permissions ;
* suppression/désactivation ;
* dépendances.

### Certificats

Tester avec plusieurs employés.

### Sécurité

Tester l'accès à une ressource d'un autre personnel en modifiant manuellement son ID.

### Frontend

Tester :

* desktop ;
* tablette ;
* mobile ;
* sidebar ;
* loading ;
* erreurs API ;
* états vides.

---

# 26. SI TU TROUVES UN BUG

Ne l'ignore pas.

Ne masque pas le bug.

Ne fais pas simplement :

```javascript
catch(() => {})
```

ou une solution qui cache l'erreur.

Pour chaque bug :

1. reproduis-le ;
2. trouve la cause ;
3. corrige la cause ;
4. teste la correction ;
5. vérifie qu'elle ne casse rien d'autre ;
6. reteste le scénario initial.

Si le bug révèle une faiblesse architecturale, corrige-la proprement sans réécrire inutilement tout le projet.

---

# 27. QUALITÉ DU CODE

Respecte l'architecture actuelle.

Évite :

* duplication ;
* logique métier dans React lorsque le backend doit la gérer ;
* requêtes SQL dispersées inutilement ;
* valeurs hardcodées ;
* solutions temporaires ;
* hacks ;
* contournements de permissions ;
* suppression de contraintes pour éviter une erreur.

Utilise les abstractions déjà présentes dans le projet.

---

# 28. NE MODIFIE PAS INUTILEMENT LE DESIGN

Le projet doit rester cohérent avec son interface actuelle.

Tu peux améliorer l'ergonomie lorsque cela est nécessaire pour les fonctionnalités ci-dessus, mais ne transforme pas tout le frontend sans raison.

Priorité :

```text
fonctionnement
+
sécurité
+
intégrité des données
+
ergonomie
```

---

# 29. ORDRE D'EXÉCUTION

Travaille dans cet ordre :

### Phase 1

Audit complet du projet.

### Phase 2

Audit PostgreSQL réel.

### Phase 3

Architecture et plan de correction.

### Phase 4

Contrats + historique + documents.

### Phase 5

Notifications automatiques + renouvellement/non-renouvellement.

### Phase 6

Correction du bug de suppression des comptes.

### Phase 7

Correction du bug des certificats administratifs.

### Phase 8

Permissions et sécurité.

### Phase 9

Frontend : historique, notifications, contrats, sidebar.

### Phase 10

Responsive + loading/skeleton.

### Phase 11

Tests complets.

### Phase 12

Correction des bugs trouvés pendant les tests.

### Phase 13

Deuxième audit complet de non-régression.

---

# 30. RÈGLE IMPORTANTE SUR LES AMBIGUÏTÉS MÉTIER

Ne fabrique jamais une règle métier simplement parce qu'une information te manque.

Si tu trouves :

* une règle contradictoire ;
* une information absente du code ;
* deux comportements possibles ;
* une règle juridique/administrative qui ne peut pas être déduite techniquement ;

cherche d'abord dans :

1. code ;
2. base ;
3. documentation ;
4. migrations ;
5. configuration ;
6. commentaires existants.

Si aucune source ne permet de trancher et que le choix change réellement le fonctionnement métier, demande-moi.

Pour les détails techniques, prends toi-même la décision appropriée.

---

# 31. GIT

Avant les modifications importantes, vérifie l'état Git.

Ne supprime pas mon travail existant.

Ne fais pas de reset destructif.

À la fin, indique précisément :

* fichiers modifiés ;
* fichiers créés ;
* migrations créées ;
* tables/colonnes ajoutées ou modifiées ;
* tests exécutés ;
* bugs corrigés ;
* éventuels points restant à valider.

Ne committe pas de secrets ou de fichiers `.env`.

---

# 32. README ET DOCUMENTATION

Après stabilisation des fonctionnalités, mets à jour la documentation si nécessaire.

Le README doit progressivement refléter :

* architecture ;
* installation ;
* configuration ;
* base de données ;
* fonctionnalités ;
* rôles ;
* contrats ;
* notifications ;
* documents ;
* tests.

Ne documente pas une fonctionnalité comme terminée tant qu'elle n'a pas été réellement testée.

---

# 33. RAPPORT FINAL

À la fin, fournis-moi un rapport clair avec :

## Fonctionnalités terminées

Liste précise.

## Bugs trouvés

Pour chaque bug :

* problème ;
* cause ;
* correction ;
* test effectué.

## Base de données

* tables créées ;
* colonnes ajoutées ;
* contraintes ;
* migrations ;
* éventuelles modifications importantes.

## Tests

Indique les tests réellement exécutés et leur résultat.

## Sécurité

Indique les vérifications effectuées.

## Points restant éventuellement à faire

Uniquement les vrais points restants.

---

# CONSIGNE FINALE

Tu as l'autorisation d'effectuer les modifications techniques nécessaires, y compris dans PostgreSQL, tant qu'elles sont normales, non destructives et cohérentes avec l'architecture existante.

**Ne me demande pas confirmation pour chaque petite modification.**

Demande-moi confirmation uniquement lorsqu'une opération est réellement majeure, destructive ou présente un risque sérieux pour les données existantes.

Et surtout :

> **Ne considère jamais une fonctionnalité terminée simplement parce que le code compile.**

Elle doit être :

**implémentée → testée → corrigée si nécessaire → retestée → validée.**

Travaille directement sur le projet existant et sur la base réelle `rh_mahajanga`.

Commence maintenant par **l'audit complet du projet et de la base**, puis poursuis l'implémentation sans attendre mon intervention sauf en cas de modification majeure ou d'ambiguïté métier impossible à résoudre à partir des sources existantes.
