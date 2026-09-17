## Mission

Analyse entièrement le projet SGRH existant avant toute modification.

### Objectif unique

La seule modification autorisée est l'ajout d'un **système de Loading Skeleton professionnel, cohérent et réutilisable dans le frontend React**.

**Ne modifier aucune fonctionnalité métier existante.**

---

# 1. ANALYSE OBLIGATOIRE AVANT MODIFICATION

Commence par analyser la structure complète du projet, notamment :

* `client/`
* `client/src/`
* pages
* composants
* layouts
* contexts
* hooks
* services/API
* routes
* tableaux
* dashboards
* profils
* formulaires
* documents
* gestion des congés
* gestion du personnel
* gestion des comptes
* permissions
* Corbeille
* toutes les pages accessibles selon les rôles.

Analyse également comment les différents écrans gèrent actuellement :

* les requêtes API ;
* les états `loading` ;
* les états `error` ;
* les états `empty` ;
* les données initiales ;
* les changements de page ;
* les actions asynchrones.

**Ne modifie rien pendant cette phase d'analyse.**

Identifie les composants existants qui peuvent être réutilisés afin d'éviter de créer des doublons.

---

# 2. PÉRIMÈTRE STRICT

### Autorisé

Modifier uniquement :

```text
client/
```

et uniquement ce qui est nécessaire pour intégrer le Loading Skeleton.

### Interdit

Ne pas modifier :

```text
server/
```

Ne pas modifier :

* PostgreSQL ;
* tables ;
* migrations ;
* seed ;
* routes backend ;
* controllers ;
* services backend ;
* repositories ;
* authentification ;
* JWT ;
* permissions backend ;
* logique métier ;
* API existantes ;
* structure des données ;
* règles de gestion ;
* rôles ;
* navigation fonctionnelle.

Ne supprimer aucune fonctionnalité existante.

Ne changer aucun comportement métier existant.

---

# 3. SYSTÈME DE LOADING SKELETON

Créer un système de skeleton moderne et réutilisable dans le frontend.

Avant de créer de nouveaux composants, vérifie si une solution de skeleton existe déjà dans le projet.

Si nécessaire, créer une architecture similaire à :

```text
client/src/components/ui/skeleton/
```

avec des composants réutilisables.

Par exemple :

```text
Skeleton
TableSkeleton
CardSkeleton
ProfileSkeleton
DashboardSkeleton
DocumentSkeleton
FormSkeleton
```

Les noms peuvent être adaptés à l'architecture réelle du projet.

**Ne crée pas inutilement plusieurs composants si une abstraction plus simple suffit.**

---

# 4. UTILISATION DE TAILWIND

Le projet utilise React + Vite + Tailwind CSS.

Utiliser les mécanismes déjà présents dans le projet.

Le skeleton doit respecter :

* le design actuel ;
* les espacements existants ;
* les bordures ;
* les rayons ;
* la typographie ;
* le responsive design ;
* l'identité visuelle actuelle du SGRH.

Utiliser une animation légère et professionnelle, par exemple :

```text
animate-pulse
```

ou une solution équivalente si elle est déjà présente.

Éviter les animations lourdes.

---

# 5. ADAPTER LE SKELETON À CHAQUE TYPE DE PAGE

Ne pas utiliser un simple rectangle générique partout.

Le skeleton doit reproduire approximativement la structure du contenu attendu.

### Tableaux

Pour les listes de personnel, utilisateurs, congés, documents, etc. :

```text
Header
────────────────────────
██████   ███████   █████
██████   ███████   █████
██████   ███████   █████
██████   ███████   █████
```

Le nombre de lignes peut être raisonnable et responsive.

### Dashboard

Prévoir des placeholders pour :

* statistiques ;
* cartes ;
* graphiques si nécessaire ;
* tableaux récents ;
* activités.

### Profil

Prévoir :

* avatar ;
* nom ;
* informations personnelles ;
* informations professionnelles ;
* sections du dossier.

### Documents

Prévoir :

* titre ;
* métadonnées ;
* boutons ;
* liste/cartes de documents.

### Formulaires

Si une page charge un formulaire depuis l'API, représenter :

* labels ;
* champs ;
* sélecteurs ;
* boutons.

---

# 6. NE PAS MODIFIER LA LOGIQUE DES REQUÊTES

Point extrêmement important.

Si une page possède déjà :

```jsx
const [loading, setLoading] = useState(true);
```

réutiliser cet état.

Ne réécris pas toute la logique API simplement pour ajouter le skeleton.

Si nécessaire, faire uniquement une intégration minimale :

```jsx
if (loading) {
    return <PersonnelTableSkeleton />;
}
```

ou une approche équivalente compatible avec l'architecture existante.

Ne modifier les services/API que si c'est absolument indispensable à l'affichage du skeleton — et dans ce cas, privilégier de ne pas les modifier.

---

# 7. DURÉE DU LOADING

Ne jamais créer volontairement un délai artificiel de plusieurs secondes.

Le skeleton doit rester affiché pendant le chargement réel des données.

Prévoir éventuellement une durée minimale configurable afin d'éviter un clignotement lorsque l'API répond extrêmement rapidement.

Par exemple :

```text
300–500 ms
```

Cette valeur doit être centralisée si elle est utilisée.

Mais :

**ne jamais ralentir artificiellement les requêtes API.**

---

# 8. ÉTATS À RESPECTER

Pour chaque écran concerné, conserver clairement les trois situations :

```text
loading
   ↓
success → contenu réel

loading
   ↓
error → interface d'erreur existante

loading
   ↓
success → aucune donnée → interface empty existante
```

Le skeleton ne doit pas remplacer :

* les messages d'erreur ;
* les états vides ;
* les données réelles.

---

# 9. ACTIONS ASYNCHRONES

Lorsque c'est pertinent, améliorer également visuellement les actions asynchrones côté frontend :

* enregistrer ;
* modifier ;
* supprimer ;
* envoyer ;
* valider ;
* charger ;
* uploader.

Exemple :

```text
Enregistrer
    ↓
Enregistrement...
```

Le bouton peut être temporairement désactivé pour éviter les doubles clics.

**Attention : ne change pas la logique de l'action.**

Il s'agit uniquement de son feedback visuel.

---

# 10. RESPONSIVE

Le skeleton doit fonctionner correctement sur :

* ordinateur ;
* tablette ;
* mobile.

Il doit respecter le responsive design déjà utilisé dans le projet.

Ne pas modifier la structure fonctionnelle des pages pour cela.

---

# 11. PERMISSIONS ET RÔLES

Le skeleton ne doit absolument pas modifier le système de permissions.

Les règles existantes doivent rester identiques :

```text
SUPERADMIN
ADMIN_RH
PE
PAT
```

Ne change pas :

* les permissions ;
* les rôles ;
* les routes protégées ;
* les menus ;
* les accès.

Le skeleton doit simplement s'afficher **dans les écrans auxquels l'utilisateur a déjà accès**.

---

# 12. RÈGLE ABSOLUE : AUCUNE RÉGRESSION

Avant toute modification :

1. analyser ;
2. comprendre ;
3. identifier les fichiers concernés ;
4. déterminer la stratégie minimale ;
5. seulement ensuite modifier.

Ne refactorise pas le projet.

Ne nettoie pas du code qui n'est pas lié au skeleton.

Ne corrige pas d'autres bugs rencontrés pendant l'analyse.

Ne change pas le design général du projet.

Ne change pas la navigation.

Ne change pas les fonctionnalités.

Ne change pas les appels API.

Ne change pas la structure backend.

**Si tu trouves un problème qui n'est pas nécessaire au Loading Skeleton, laisse-le intact et signale-le simplement dans le rapport final.**

---

# 13. TESTS

Après implémentation, vérifie au minimum :

* démarrage du frontend ;
* compilation ;
* absence d'erreurs React ;
* absence d'erreurs console liées aux modifications ;
* affichage correct du skeleton ;
* disparition du skeleton après chargement ;
* état vide toujours fonctionnel ;
* état erreur toujours fonctionnel ;
* navigation toujours fonctionnelle ;
* permissions toujours fonctionnelles ;
* responsive desktop/mobile.

Vérifie particulièrement les pages qui utilisent des données API.

---

# 14. RAPPORT FINAL OBLIGATOIRE

À la fin, fournis un rapport clair contenant :

### Analyse

* architecture frontend analysée ;
* système de loading existant ;
* composants réutilisables trouvés ;
* endroits où le skeleton a été intégré.

### Modifications

Liste précise de tous les fichiers :

```text
FICHIER
→ modification effectuée
→ raison
```

### Fonctionnalités

Confirme explicitement que :

* aucune fonctionnalité métier n'a été modifiée ;
* aucune API n'a été modifiée ;
* aucun fichier backend n'a été modifié ;
* aucune base PostgreSQL n'a été modifiée ;
* aucun rôle ou permission n'a été modifié.

### Tests

Indique les tests effectués et leurs résultats.

### Problèmes détectés

Si tu as trouvé des bugs ou problèmes existants qui ne concernent pas le Loading Skeleton, liste-les séparément **sans les corriger**.

---

## CONSIGNE FINALE

**Ta mission n'est PAS d'améliorer ou de refactoriser le projet.**

Ta mission est uniquement :

> **Analyser le projet existant puis ajouter un Loading Skeleton frontend professionnel, réutilisable, responsive et cohérent avec le design actuel, sans modifier aucune fonctionnalité existante.**

Toute modification qui n'est pas directement nécessaire au Loading Skeleton est interdite.
