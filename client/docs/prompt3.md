Je veux que tu réalises une ANALYSE COMPLÈTE DE MON PROJET SGRH DE A À Z afin de créer et maintenir une documentation technique et fonctionnelle professionnelle dans le README.md.

IMPORTANT :
Tu dois d'abord analyser le projet réel dans son intégralité.

NE COMMENCE PAS par modifier le README.

Commence par comprendre le fonctionnement réel de l'application.

Le README final doit être basé sur le CODE EXISTANT, la BASE DE DONNÉES EXISTANTE et l'ARCHITECTURE RÉELLE du projet.

NE DEVINE PAS les fonctionnalités.
NE SUPPOSE PAS l'existence d'une fonctionnalité qui n'existe pas.
NE DOCUMENTE PAS quelque chose qui n'est pas réellement implémenté.

==================================================
1. ANALYSE COMPLÈTE DU PROJET
==================================================

Analyse toute l'application avant toute modification.

Identifie précisément :

### Frontend

- framework utilisé ;
- architecture React ;
- Vite ;
- Tailwind CSS ;
- organisation des dossiers ;
- pages ;
- composants ;
- composants réutilisables ;
- layouts ;
- navbar/sidebar ;
- header ;
- footer ;
- formulaires ;
- tableaux ;
- modales ;
- systèmes de recherche ;
- systèmes de filtrage ;
- gestion des états ;
- contexte/providers ;
- gestion de l'authentification ;
- protection des routes ;
- gestion des rôles ;
- appels vers l'API.

### Backend

Analyse :

- Node.js ;
- Express ;
- organisation du backend ;
- routes ;
- controllers s'ils existent ;
- services s'ils existent ;
- middleware ;
- authentification ;
- autorisation ;
- gestion des rôles ;
- validation ;
- gestion des erreurs ;
- connexion PostgreSQL ;
- variables d'environnement ;
- API disponibles.

Pour chaque route API, identifie si possible :

- méthode HTTP ;
- URL ;
- rôle nécessaire ;
- données reçues ;
- données retournées ;
- objectif de la route.

### Base de données

Analyse complètement :

- schema.sql ;
- migrations s'il y en a ;
- seed.sql ;
- tables ;
- colonnes ;
- types ;
- clés primaires ;
- clés étrangères ;
- contraintes ;
- relations ;
- tables d'association ;
- contraintes UNIQUE ;
- contraintes NOT NULL ;
- valeurs possibles ;
- index s'ils existent.

Ne te limite pas aux noms des tables.

Comprends réellement les relations entre les données.

==================================================
2. COMPRENDRE LE FONCTIONNEMENT MÉTIER
==================================================

Je veux que tu comprennes également le fonctionnement métier du SGRH.

Identifie notamment les rôles utilisateurs réellement présents dans le code.

Par exemple, vérifie la gestion de :

- Super Admin ;
- Admin RH ;
- Personnel ;
- PE ;
- PAT ;

mais ne documente ces rôles comme fonctionnalités existantes que si leur présence et leur fonctionnement sont confirmés par le code.

Analyse les principaux flux métier réellement implémentés.

Par exemple, si le code le confirme :

- connexion ;
- authentification ;
- gestion des employés ;
- recherche d'un personnel ;
- invitation d'un personnel ;
- création de compte ;
- validation de compte ;
- gestion des comptes ;
- gestion des établissements ;
- gestion des fonctions ;
- carrière ;
- congés ;
- notifications ;
- historique ;
- paramètres.

Pour chaque fonctionnalité réellement présente, explique :

1. À quoi elle sert.
2. Qui peut l'utiliser.
3. Comment elle fonctionne.
4. Quelles données elle utilise.
5. Avec quelles autres fonctionnalités elle communique.

==================================================
3. COMPRENDRE LE FLUX COMPLET D'UNE ACTION
==================================================

Pour les fonctionnalités importantes, analyse le chemin complet :

Utilisateur
↓
Interface React
↓
Composant
↓
Appel API
↓
Route Express
↓
Logique backend
↓
PostgreSQL
↓
Réponse API
↓
Interface React

Je veux que le README explique ce fonctionnement simplement.

Utilise des exemples concrets.

Par exemple :

"Lorsqu'un Admin RH recherche un personnel..."

explique ce qui se passe depuis le clic dans l'interface jusqu'à la récupération des données PostgreSQL.

Ne crée pas de détails fictifs.

==================================================
4. DOCUMENTATION DE LA BASE DE DONNÉES
==================================================

Crée dans le README une section complète :

# Structure de la base de données

Explique :

- le rôle de la base PostgreSQL ;
- les principales tables ;
- le rôle de chaque table ;
- les relations entre les tables ;
- les tables d'association ;
- les clés étrangères ;
- les contraintes importantes.

Ajoute également un diagramme UML / ERD de la base de données.

IMPORTANT :

Utilise Mermaid directement dans README.md.

Exemple de structure :

```mermaid
erDiagram
    USERS ||--o| EMPLOYEES : "correspond à"
    ROLES ||--o{ USERS : "attribue"
    EMPLOYEES ||--o{ EMPLOYEE_ESTABLISHMENTS : "affecté à"
    ESTABLISHMENTS ||--o{ EMPLOYEE_ESTABLISHMENTS : "contient"