### AUTORISATION DE MODIFICATION DE LA BASE DE DONNÉES

Tu es autorisé à travailler directement sur la base PostgreSQL locale du projet :

* Host : `localhost`
* Database : `rh_mahajanga`
* User : `rh_admin`
* Port : `5432`

Tu peux, de manière autonome :

* créer de nouvelles tables ;
* ajouter des colonnes ;
* modifier la structure de tables existantes ;
* créer ou modifier des contraintes ;
* créer des clés étrangères ;
* créer des index ;
* créer des tables de liaison ;
* créer des migrations ;
* ajouter des données de référence nécessaires au fonctionnement ;
* corriger des incohérences entre le backend et la base ;
* modifier le schéma lorsque cela est nécessaire pour implémenter correctement les fonctionnalités demandées.

### MODIFICATIONS MAJEURES

Tu dois cependant me demander confirmation AVANT toute opération considérée comme majeure ou potentiellement dangereuse, notamment :

* suppression d'une table existante ;
* suppression d'une colonne contenant des données ;
* modification susceptible de faire perdre ou altérer des données existantes ;
* migration destructive ;
* modification importante d'une relation ou contrainte pouvant affecter une grande partie des données ;
* renommage d'une table ou colonne utilisée par plusieurs parties du projet lorsque la migration présente un risque ;
* suppression massive de données ;
* changement de structure nécessitant une migration complexe avec risque sur les données existantes.

Dans ce cas, NE FAIS PAS immédiatement la modification.

Présente-moi simplement :

1. ce que tu veux modifier ;
2. pourquoi c'est nécessaire ;
3. les tables/colonnes concernées ;
4. l'impact potentiel sur les données existantes ;
5. la migration prévue ;
6. les mesures prévues pour éviter une perte de données.

Puis attends ma confirmation.

### MODIFICATIONS NORMALES

Pour les modifications non destructives et raisonnablement sûres, ne me demande pas inutilement la permission.

Par exemple, tu peux directement :

* créer une table nécessaire à une nouvelle fonctionnalité ;
* ajouter une colonne nullable ;
* ajouter un index ;
* ajouter une table d'historique ;
* ajouter une table de documents ;
* ajouter une relation nécessaire ;
* créer une migration ;
* ajouter des statuts ou données de référence lorsque cela ne détruit pas les données existantes.

### RÈGLE ABSOLUE

Ne fais jamais de :

`DROP DATABASE`

`DROP SCHEMA`

`TRUNCATE`

ou suppression massive de données pour résoudre un problème ou faciliter les tests.

Si une suppression destructive semble réellement nécessaire, arrête-toi et demande mon autorisation explicite.

### AVANT CHAQUE MODIFICATION DE STRUCTURE

Analyse d'abord :

* le schéma PostgreSQL réel ;
* les tables existantes ;
* les contraintes ;
* les clés étrangères ;
* les index ;
* les données existantes ;
* le code backend qui utilise ces tables ;
* les routes/API concernées ;
* le frontend qui dépend de ces données.

Ne suppose jamais la structure de la base à partir d'une ancienne version du projet.

La base `rh_mahajanga` actuellement utilisée est la source de vérité.

### TEST

Après chaque modification de base :

1. exécute la migration ;
2. vérifie que PostgreSQL l'accepte ;
3. vérifie les contraintes ;
4. vérifie que les données existantes sont toujours cohérentes ;
5. teste le backend ;
6. teste les API concernées ;
7. teste le frontend si nécessaire ;
8. corrige les problèmes détectés ;
9. reteste.

Ne considère jamais une modification terminée simplement parce que la commande SQL s'est exécutée sans erreur.

Principe :

**Analyser → Modifier → Tester → Vérifier les données → Corriger → Retester → Valider.**
