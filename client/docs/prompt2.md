Je veux que tu prennes en charge la mise en ligne complète de mon projet SGRH sur mon dépôt GitHub :

https://github.com/tanahelr-create/SGRH.git

IMPORTANT :
Le projet est une application complète avec un frontend React + Vite + Tailwind CSS et un backend Node.js + Express + PostgreSQL.

Ton objectif est de :
1. vérifier l'état actuel du projet ;
2. connecter correctement le projet à mon dépôt GitHub ;
3. protéger mes fichiers .env ;
4. envoyer le projet complet sur GitHub ;
5. mettre en place une procédure propre pour que les grands changements soient automatiquement vérifiés et déployés lorsque cela est possible ;
6. NE JAMAIS exposer mes secrets.

==================================================
ÉTAPE 1 — ANALYSER LE PROJET AVANT TOUTE MODIFICATION
==================================================

NE MODIFIE RIEN IMMÉDIATEMENT.

Commence par analyser complètement le projet depuis sa racine.

Identifie notamment :

- frontend ;
- backend ;
- package.json frontend ;
- package.json backend ;
- vite.config ;
- configuration Tailwind ;
- fichiers .env ;
- fichiers .env.example s'ils existent ;
- configuration PostgreSQL ;
- scripts npm ;
- configuration Git existante ;
- .gitignore existant ;
- éventuels fichiers GitHub Actions ;
- éventuels fichiers de déploiement ;
- éventuels fichiers Docker ;
- éventuels fichiers de configuration d'hébergement.

Vérifie également si le projet possède déjà un dépôt Git local.

Analyse :

git status

git remote -v

git branch

git log --oneline -n 10

si nécessaire.

AVANT DE MODIFIER QUOI QUE CE SOIT, explique-moi brièvement :

- l'état actuel de Git ;
- la branche actuelle ;
- le remote actuel ;
- les fichiers qui seront envoyés ;
- les fichiers sensibles détectés ;
- la stratégie que tu vas utiliser pour GitHub ;
- la stratégie envisagée pour le déploiement automatique.

==================================================
ÉTAPE 2 — PROTECTION ABSOLUE DES .ENV
==================================================

J'ai DEUX fichiers .env dans le projet.

Ils doivent rester UNIQUEMENT sur ma machine locale.

IMPORTANT :

NE LIS PAS ET N'AFFICHE PAS leurs valeurs secrètes dans ta réponse.

Tu peux vérifier leur existence et leurs noms afin de les protéger, mais ne m'affiche jamais :

- mots de passe ;
- tokens ;
- clés secrètes ;
- clés JWT ;
- chaînes de connexion PostgreSQL ;
- API keys ;
- credentials ;
- autres secrets.

Ajoute les deux fichiers .env appropriés dans .gitignore.

Utilise des règles suffisamment propres pour empêcher leur ajout futur au dépôt.

Par exemple, vérifie si une règle de ce type est appropriée :

.env
.env.*
!.env.example

Mais adapte-la à la structure réelle du projet.

IMPORTANT :
Si des fichiers .env ont déjà été ajoutés à Git dans le passé, ne te contente PAS de les mettre dans .gitignore.

Vérifie s'ils sont suivis par Git.

S'ils sont déjà suivis :

- retire-les de l'index Git ;
- conserve les fichiers localement ;
- assure-toi qu'ils ne seront plus commités.

IMPORTANT :
Avant de pousser quoi que ce soit sur GitHub, vérifie également qu'aucun secret n'est présent dans :

- fichiers JavaScript ;
- fichiers JSX ;
- fichiers JSON ;
- fichiers de configuration ;
- README ;
- scripts ;
- fichiers de test ;
- fichiers SQL ;
- anciens fichiers de configuration.

Ne supprime pas arbitrairement des données.

Si tu trouves un secret potentiellement exposé, arrête le push et signale-moi précisément le fichier concerné sans afficher la valeur secrète.

==================================================
ÉTAPE 3 — CRÉER DES .ENV.EXAMPLE SI NÉCESSAIRE
==================================================

Si le projet n'a pas encore de fichiers .env.example, crée les fichiers nécessaires.

Ils doivent contenir uniquement les noms des variables nécessaires, sans aucune vraie valeur secrète.

Exemple :

DATABASE_URL=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
PORT=

Mais utilise UNIQUEMENT les variables réellement utilisées par mon projet après analyse.

Le but est qu'une autre personne puisse comprendre quelles variables sont nécessaires sans obtenir mes secrets.

==================================================
ÉTAPE 4 — VÉRIFIER LE .GITIGNORE
==================================================

Améliore .gitignore si nécessaire.

Il doit notamment empêcher l'envoi de :

- .env ;
- .env.local ;
- .env.* ;
- node_modules ;
- fichiers de build ;
- fichiers temporaires ;
- logs ;
- fichiers système ;
- fichiers contenant des secrets.

Mais NE PAS ignorer :

- le code source ;
- package.json ;
- package-lock.json ;
- fichiers SQL nécessaires ;
- README ;
- fichiers de configuration nécessaires ;
- fichiers du frontend ;
- fichiers du backend.

Ne mets pas des règles trop larges qui empêcheraient le projet de fonctionner ou qui cacheraient des fichiers importants.

==================================================
ÉTAPE 5 — VÉRIFIER LE DÉPÔT GITHUB
==================================================

Le dépôt cible est :

https://github.com/tanahelr-create/SGRH.git

Vérifie d'abord le remote local.

Si aucun remote n'est configuré, configure :

origin → https://github.com/tanahelr-create/SGRH.git

Si un autre remote existe, ne l'écrase pas aveuglément.

Analyse d'abord la situation.

Je veux que le dépôt GitHub utilise la branche principale :

main

Si le projet utilise actuellement master ou une autre branche, analyse la situation avant de renommer ou fusionner.

==================================================
ÉTAPE 6 — VÉRIFIER LE CONTENU AVANT LE PREMIER PUSH
==================================================

Avant le premier push :

1. Fais un git status.
2. Vérifie les fichiers qui seront commités.
3. Vérifie particulièrement qu'aucun .env n'est inclus.
4. Vérifie qu'aucun node_modules n'est inclus.
5. Vérifie qu'aucun secret n'est inclus.
6. Vérifie que le frontend est présent.
7. Vérifie que le backend est présent.
8. Vérifie que les fichiers SQL nécessaires sont présents.
9. Vérifie que package.json et package-lock.json sont présents lorsqu'ils existent.
10. Vérifie que le README est présent ou améliore-le si nécessaire.

Je veux que le dépôt GitHub contienne le PROJET COMPLET, pas uniquement le frontend.

==================================================
ÉTAPE 7 — INSTALLATION ET BUILD
==================================================

Avant de pousser le projet, vérifie que les dépendances et les scripts fonctionnent.

Pour le frontend :

- vérifie npm install / npm ci selon la situation ;
- exécute le build prévu par package.json ;
- vérifie qu'il n'y a pas d'erreur de compilation.

Pour le backend :

- vérifie que le projet démarre correctement ;
- vérifie les scripts npm ;
- vérifie que les imports sont corrects.

IMPORTANT :

Ne modifie pas la logique métier simplement parce qu'une erreur existe.

Si tu rencontres une erreur indépendante du déploiement :

- identifie-la ;
- explique-la ;
- corrige-la uniquement si elle est clairement nécessaire pour permettre le build ou le déploiement ;
- sinon signale-la.

==================================================
ÉTAPE 8 — COMMIT ET PUSH GITHUB
==================================================

Une fois toutes les vérifications terminées :

Prépare un commit propre.

Le message peut être par exemple :

"chore: initial project deployment"

ou un message plus approprié selon l'état réel du dépôt.

Avant le commit, affiche/vérifie la liste des fichiers qui seront commités.

Ensuite :

git add

git commit

git push

vers le dépôt :

https://github.com/tanahelr-create/SGRH.git

IMPORTANT :

Ne force jamais un push avec :

git push --force

sauf si je te le demande explicitement.

Ne supprime pas l'historique Git existant sans mon autorisation.

Si le dépôt GitHub contient déjà des commits qui ne sont pas présents localement, arrête-toi avant une opération destructive et analyse la situation.

==================================================
ÉTAPE 9 — DÉPLOIEMENT AUTOMATIQUE
==================================================

Je veux que les grands changements du projet puissent être automatiquement vérifiés et déployés.

Avant de mettre cela en place, analyse la structure réelle du projet et détermine ce qui est techniquement possible.

IMPORTANT :

Ne suppose PAS que GitHub seul peut héberger mon application complète.

Mon application possède :

- frontend React/Vite ;
- backend Node/Express ;
- PostgreSQL.

GitHub Pages ne peut pas héberger directement mon backend Express ni ma base PostgreSQL.

Donc :

1. Si un système de déploiement existe déjà dans le projet, utilise-le après l'avoir analysé.
2. Si aucun hébergeur n'est configuré, ne choisis pas arbitrairement un fournisseur payant.
3. Mets au minimum en place une GitHub Action permettant de vérifier automatiquement le projet après un push important vers main :
   - installation des dépendances ;
   - build frontend ;
   - vérification du backend ;
   - tests disponibles s'ils existent.
4. Si une configuration de déploiement réelle est déjà présente, utilise-la.
5. Si aucun hébergeur n'est présent, prépare une structure propre permettant d'ajouter ultérieurement le déploiement automatique vers un hébergeur adapté.

Le workflow GitHub Actions doit éviter d'exposer les secrets.

Les secrets nécessaires au déploiement devront utiliser les GitHub Actions Secrets / Variables, et JAMAIS être écrits directement dans le code.

==================================================
ÉTAPE 10 — "GRANDS CHANGEMENTS"
==================================================

Je veux éviter de lancer automatiquement un déploiement à chaque petite modification locale.

Utilise une stratégie raisonnable basée sur Git.

Par exemple :

- travail local ;
- plusieurs petites modifications ;
- tests locaux ;
- commit ;
- push vers main ;
- GitHub Actions vérifie le projet ;
- si un véritable hébergement est configuré, le déploiement est déclenché automatiquement.

Ne crée pas un système compliqué de détection artificielle des "grands changements" si ce n'est pas nécessaire.

La priorité est d'avoir un workflow fiable et simple.

==================================================
ÉTAPE 11 — NE PAS MODIFIER LES FONCTIONNALITÉS
==================================================

Cette opération concerne principalement :

- Git ;
- GitHub ;
- .gitignore ;
- sécurité des secrets ;
- CI/CD ;
- configuration de déploiement.

NE MODIFIE PAS les fonctionnalités de l'application.

NE REFAIS PAS le frontend.

NE MODIFIE PAS le design.

NE MODIFIE PAS les routes.

NE MODIFIE PAS les API.

NE MODIFIE PAS la base de données sauf si une modification est strictement nécessaire au déploiement, et dans ce cas explique-la avant de l'effectuer.

==================================================
ÉTAPE 12 — VÉRIFICATION FINALE
==================================================

À la fin, vérifie :

git status

git remote -v

git branch

et vérifie que le dépôt est propre.

Vérifie également que :

- les .env sont bien ignorés ;
- les .env ne sont pas sur GitHub ;
- node_modules n'est pas sur GitHub ;
- le frontend est présent ;
- le backend est présent ;
- les fichiers nécessaires sont présents ;
- le projet compile ;
- le workflow GitHub Actions est valide s'il a été créé ;
- aucune fonctionnalité n'a été volontairement modifiée.

==================================================
RAPPORT FINAL
==================================================

À la fin, donne-moi un rapport clair avec :

1. État initial du dépôt Git
2. Branche utilisée
3. Remote GitHub configuré
4. Fichiers .env protégés
5. Modifications apportées au .gitignore
6. Fichiers ajoutés à GitHub
7. Commit créé
8. Push effectué ou raison de son impossibilité
9. GitHub Actions créée ou non
10. Ce qui est automatiquement vérifié
11. Ce qui est automatiquement déployé
12. Si aucun hébergeur n'est configuré, explique-le clairement
13. Éventuelles erreurs restantes

RÈGLES ABSOLUES :

- ANALYSE D'ABORD.
- NE PUSH JAMAIS UN .ENV.
- NE RÉVÈLE JAMAIS MES SECRETS.
- NE FAIS PAS DE FORCE PUSH.
- NE SUPPRIME PAS L'HISTORIQUE EXISTANT.
- NE MODIFIE PAS LES FONCTIONNALITÉS DE L'APPLICATION.
- NE CHOISIS PAS D'HÉBERGEUR PAYANT SANS MON AUTORISATION.
- VÉRIFIE LE PROJET AVANT LE PREMIER PUSH.