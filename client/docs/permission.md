Analyse d’abord entièrement le système actuel de rôles et permissions de mon projet SGRH avant de modifier quoi que ce soit.

La règle métier à respecter est la suivante :

**Le SUPERADMIN possède tous les droits fonctionnels de l’ADMIN_RH, mais il dispose en plus de ses propres fonctionnalités d’administration globale.**

Donc :

* SUPERADMIN = droits ADMIN_RH + droits spécifiques SUPERADMIN ;
* ADMIN_RH = fonctionnalités RH normales ;
* PE et PAT = uniquement leurs fonctionnalités personnelles.

Les fonctionnalités spécifiques au SUPERADMIN comprennent notamment :

* gestion des comptes utilisateurs ;
* approbation/refus des comptes en attente ;
* activation/désactivation/suppression des comptes ;
* gestion des rôles et permissions ;
* administration globale du système ;
* **gestion complète de la CORBEILLE** : consultation, restauration, suppression définitive et autres actions déjà prévues dans le projet.

Ne crée pas un nouveau système de permissions si un système existe déjà. Analyse et complète celui qui est présent dans le projet.

Vérifie la sécurité sur toute la chaîne :
Frontend → routes API → middlewares → controllers → services → repositories → PostgreSQL.

Le frontend ne doit servir qu’à masquer/afficher les fonctionnalités. La vraie autorisation doit obligatoirement être vérifiée côté backend.

Ne supprime aucune donnée, ne recrée pas la base PostgreSQL et ne modifie pas les fonctionnalités qui ne concernent pas les rôles/permissions.

À la fin, donne-moi :

1. la matrice complète des permissions pour SUPERADMIN, ADMIN_RH, PE et PAT ;
2. les permissions spécifiques au SUPERADMIN ;
3. les routes backend protégées par chaque permission ;
4. les fichiers modifiés ;
5. les tests à effectuer pour vérifier chaque rôle.
