Oui. En me basant sur **l’état actuel du SGRH tel qu’on l’a suivi ensemble**, je retire les éléments que tu as déjà terminés. Voici uniquement la **checklist des tâches restantes**.

# 🔴 À FAIRE — SGRH

## 1. 🏛️ Carrière & situation administrative

*Statut vérifié le 2026-09-19 : ce bloc existait déjà avant la mission grilles indiciaires (`situations_administratives`, `situationAdministrativeService/Repository/routes`, branché dans `Carriere.jsx` et `MaCarriere.jsx`). Relu et vérifié en détail lors de cette passe.*

* ✅ Finaliser la **situation administrative** comme bloc indépendant de la timeline carrière — table `situations_administratives` séparée de `carriere_evenements`, service/repo/route dédiés
* ✅ Garantir qu'une seule situation soit ouverte à la fois — appliqué au niveau service (`findCurrentOpen`), **pas de contrainte `UNIQUE ... WHERE date_fin IS NULL` en base** (à ajouter si on veut une garantie DB en plus du service)
* ✅ Fermer automatiquement l'ancienne situation lors de la création d'une nouvelle — `closeSituation` appelé dans `addSituation`
* ✅ Gérer `date_debut` / `date_fin`
* 🟡 Empêcher les chevauchements de situations — vérifié seulement contre la situation ouverte courante (`dateDebut >= current.date_debut`), pas de vérification contre tout l'historique ; suffisant tant que le flux passe uniquement par `addSituation`, mais pas garanti si une donnée est insérée autrement
* ✅ Ajouter le **motif du changement** — colonne `motif` (migration 004)
* ✅ Afficher clairement la situation actuelle — `historique.find(s => !s.date_fin)`
* ✅ Afficher l'historique complet des situations
* ✅ Vérifier modification/suppression d'une situation — `updateSituation`/`deleteSituation` codés, y compris réouverture de la situation précédente si on supprime la courante
* ⬜ Tester tous les changements de situation — pas retesté en live dans cette session (aucune modification apportée à ce module cette passe)

---

## 2. 🔢 Gestion des indices

*Fait le 2026-09-19 — mission "Modélisation complète des grilles indiciaires" : audit + recherche réglementaire (Loi 2003-011, Décret 97-009, Circulaire 132/2005, Décret 2005-134, Décret 96-745) puis implémentation. 3 migrations (006-008), moteur `resolveIndice()` centralisé, 13 tests automatisés passants, vérifié en HTTP direct avec comptes jetables. Détails dans le README section "Grilles indiciaires et carrière".*

* ✅ Finaliser la gestion de l'indice — **pour le régime FONCTIONNAIRE, classe exceptionnelle uniquement** (seule donnée chiffrée vérifiée dans un texte officiel) ; principalat/1ère/2ème classe et régime agents non encadrés (EFA/ELD) restent volontairement non peuplés faute de texte fiable trouvé — schéma prêt, à compléter dès confirmation RH ou texte localisé (règle "ne rien inventer")
* ✅ Gérer la partie numérique (`950`) — colonne `indice_num INTEGER` sur `personnel` et `carriere_evenements`
* ✅ Gérer le code (`FOP`) — `code_grille_affichage`, jamais concaténé en dur ; `parseIndiceAffiche`/`formatDisplay` dans `grilleIndiciaireService.js`
* ✅ Associer l'indice à la situation/carrière — `ligne_grille_id` sur `carriere_evenements`, `ligne_grille_actuelle_id` sur `personnel`
* ✅ Afficher l'indice actuel — `MaCarriere.jsx`/`Profil.jsx`/`Carriere.jsx` via `formatIndiceDisplay`
* ✅ Conserver l'historique des indices — chaque `carriere_evenements` garde son propre `indice_num`/`ligne_grille_id`, jamais réécrit
* ✅ Gérer les changements d'indice — `avancementService.traiterAvancementEchelon` (validation RH obligatoire, jamais automatique) + `calculerReclassementIndiciaire` (règle étroite Art.49/Décret 2005-134) + alertes `alertes_avancement`
* ✅ Vérifier qu'un **simple renouvellement de contrat ne modifie pas automatiquement l'indice** — confirmé par grep : aucune référence à `indice` dans les services/contrôleurs/repositories de contrats

---

## 3. 📄 Contrats ELD / PAT / PE

*Statut vérifié le 2026-09-19 (audit + tests live avec comptes jetables). L'essentiel existait déjà (implémenté avant cette passe, checklist non tenue à jour) ; 2 vrais bugs trouvés et corrigés ci-dessous.*

* ✅ Finaliser l'import des contrats
* ✅ Accepter uniquement les PDF — extension **et** contenu réel (magic bytes `%PDF-`) vérifiés désormais, pas seulement le nom du fichier (`server/src/utils/fileSignature.js`)
* ✅ Sécuriser le stockage des contrats — `server/private-uploads/contrats`, jamais servi par `express.static`
* ✅ Afficher les contrats sur la fiche personnel
* ✅ Permettre au RH de télécharger un contrat
* ✅ Permettre au personnel de télécharger **uniquement son propre contrat** — vérifié en direct (compte "owner" OK, compte "other" → 403)
* ✅ Empêcher l'accès au contrat d'un autre personnel — idem
* 🟡 Gérer le remplacement d'un contrat — il n'existe pas de "remplacer le PDF actuel" ; on ne peut qu'ajouter une pièce supplémentaire (avenant) sans jamais écraser l'original. C'est cohérent avec la règle "jamais d'écrasement silencieux", mais il n'y a aucun moyen de corriger un PDF mal importé autrement qu'en base
* ✅ Conserver l'historique des contrats
* ✅ Corriger définitivement le problème **403 Forbidden** lié aux documents/PDF — **bug réel trouvé et corrigé** : un SUPERADMIN recevait un 403 sur tout document qui n'était pas sa propre fiche personnel, car `contratService.js:173` ne testait que `role === 'ADMIN_RH'` (le SUPERADMIN hérite normalement de tous les droits ADMIN_RH ailleurs dans l'app, mais pas ici). Corrigé + vérifié en direct sur les 4 types de documents (contrats, situations administratives, carrière, congés)

---

## 4. 🔄 Renouvellement des contrats

*Statut vérifié le 2026-09-19. Déjà implémenté avant cette passe ; 1 bug d'ordonnancement trouvé et corrigé.*

* ✅ Détecter les contrats arrivant prochainement à échéance — `contratEcheanceJob.js` (183 jours avant échéance)
* ✅ Afficher les contrats concernés au RH
* ✅ Workflow de renouvellement
* ✅ Workflow de renouvellement avec renégociation
* ✅ Workflow de non-renouvellement
* ✅ Demander un motif obligatoire pour le non-renouvellement — validé serveur + contrainte SQL + client
* ✅ Enregistrer le motif
* ✅ Conserver l'historique des décisions
* ✅ Créer le nouveau contrat après renouvellement
* ✅ Clôturer correctement l'ancien contrat — **bug réel trouvé et corrigé** : l'ancien contrat était marqué "renouvelé" **après** la création du nouveau, ce qui aurait laissé passer deux contrats "actif" simultanés pour la même personne. Corrigé (clôture avant création) et une contrainte SQL empêche maintenant ce cas structurellement (migration 009, `uniq_contrats_actif_par_personnel`), vérifié en direct

---

# 🔴 5. 🔔 Notifications RH

*Statut vérifié le 2026-09-19. L'essentiel (triggers automatiques + cloche + lien cliquable) existait déjà. Un gap réel identifié, non corrigé cette passe (hors périmètre sécurité).*

* ✅ Finaliser les notifications automatiques
* ✅ Notification d'approche d'expiration d'un contrat
* ✅ Notification de contrat expiré
* ✅ Notification de renouvellement
* ✅ Notification de non-renouvellement
* ✅ Notification de changement de situation administrative
* ✅ Notification des événements RH importants — avancement d'échelon (`avancementEcheanceJob.js`)
* ✅ Vérifier les destinataires
* ✅ Badge compteur non-lu
* ✅ Marquer comme lu
* ✅ Tout marquer comme lu
* 🟡 Accès depuis la cloche vers l'élément concerné — fonctionne pour les 4 déclencheurs automatiques (contrat, situation, avancement). **Gap identifié, non corrigé** : l'envoi manuel de notification (`EnvoyerNotification.jsx` → `notificationController.js`) ne renseigne jamais `lien`, donc une notification envoyée à la main par le RH n'est pas cliquable

---

# 🔴 6. 🧭 Nettoyage de la Sidebar

*Statut vérifié le 2026-09-19 : déjà propre, rien à faire.*

* ✅ Faire l'inventaire des entrées actuelles — `menuConfig.js`, config unique bien organisée par rôle, aucune entrée orpheline (toutes les routes ont une entrée menu ou sont volontairement accessibles hors sidebar, ex. `/notifications`, `/parametres`)
* ✅ Supprimer les doublons — aucun trouvé
* ✅ Regrouper les fonctionnalités similaires — déjà fait (voir commentaires dans le fichier)
* ✅ Retirer les éléments secondaires inutiles
* ✅ Adapter la sidebar selon le rôle — `Sidebar.jsx` filtre déjà par permission/rôle
* ✅ Éviter d'avoir les notifications comme élément inutilement séparé
* ✅ Vérifier que la navigation reste claire après le nettoyage

---

# 🟠 7. 📱 Responsive & Sidebar mobile

*Statut vérifié le 2026-09-19 (lecture de code uniquement, pas de test visuel navigateur cette passe).*

* 🟡 Adapter les pages aux écrans laptop — la majorité des pages n'ont pas de classes responsive du tout (`lg:`/`md:` utilisés dans seulement ~1/3 des fichiers), effectivement conçues pour desktop fixe
* ⬜ Vérifier 1366×768 — non testé visuellement
* ⬜ Vérifier les grands écrans — non testé visuellement
* 🟡 Adapter aux tablettes — dépend des mêmes classes manquantes que ci-dessus
* 🟡 Adapter aux smartphones — idem
* ✅ Sidebar rétractable — déjà implémenté (`Sidebar.jsx`, drawer + overlay)
* ✅ Menu hamburger sur mobile — `TopBar.jsx`
* ✅ Fermeture de la sidebar après navigation — déjà implémenté (`onClick={onClose}` sur chaque lien + Echap + clic sur l'overlay)
* ✅ Adapter les tableaux au mobile — les 3 pages avec `<table>` ont déjà `overflow-x-auto`
* 🟡 Adapter les formulaires — plusieurs grilles fixes sans repli mobile identifiées : `Conges.jsx`, `FicheDemande.jsx`, `Personnel.jsx`, `DocumentsAdmin.jsx` (non corrigé cette passe)
* ✅ Adapter les modales — déjà raisonnablement responsive (`max-w-* w-full p-4`)
* 🟡 Éliminer les débordements horizontaux — pas vérifié systématiquement page par page

---

# 🟠 8. 🎨 Harmonisation Design / UX

*Fait le 2026-09-19 (partiel, volontairement) : la bibliothèque de composants demandée dans la mission "UI partagée / toasts / skeletons" a été créée dans `client/src/components/ui/` (Button, Input, Select, Textarea, Checkbox, Badge, Card, Modal, ConfirmDialog, Table, EmptyState, Skeleton/SkeletonText/SkeletonAvatar/SkeletonCard/SkeletonTable/SkeletonPage — export groupé via `ui/index.js`), avec le même design (couleurs `navy`/`gold`/`status-*`, mêmes classes que l'existant) — mais appliquée seulement aux pages prioritaires (personnel, fiche employé, carrière, contrats, congés, documents, paramètres), pas aux ~60 pages du projet. Voir le détail dans le bloc "UI Component Library" plus bas.*

* ⬜ Revoir les pages qui apparaissent trop petites — non évalué visuellement, hors périmètre de cette passe
* ⬜ Recentrer correctement les contenus — idem
* ⬜ Améliorer l'utilisation de l'espace disponible — idem
* 🟡 Uniformiser les boutons — composant `Button` créé (variantes primary/secondary/danger/ghost + état `loading`), utilisé dans les 3 modales migrées ; **pas encore appliqué** aux ~99 boutons existants ailleurs (risque de régression trop élevé pour le faire en masse sans revue page par page)
* 🟡 Uniformiser les cartes — composant `Card` créé, pas encore appliqué partout (le remplacement pur est à faible risque, juste non prioritaire cette passe)
* 🟡 Uniformiser les tableaux — coquille `Table`/`TableHead`/`TableBody`/`TableRow`/`TableCell` créée, pas encore appliquée (les 3 tables existantes gardent leur JSX natif + leur logique de tri/filtre intacte)
* ⬜ Uniformiser les formulaires — `Input`/`Select`/`Textarea`/`Checkbox`/`FormField` créés, pas encore substitués aux champs existants (uniquement utilisés dans du nouveau code)
* ✅ Uniformiser les modales — `Modal` créé et **les 3 modales existantes y sont migrées** (`AjouterEmployeModal`, `ModifierEmployeModal`, la modale de non-renouvellement dans `Contrats.jsx`) : Echap pour fermer, `role="dialog"` + `aria-modal="true"`, focus posé sur le premier champ à l'ouverture (bug de focus trouvé et corrigé pendant les tests — il tombait d'abord sur le bouton "Fermer"), focus restauré à la fermeture. Vérifié en navigateur réel.
* ⬜ Uniformiser les badges — composant `Badge` créé, pas encore substitué aux badges existants
* ⬜ Uniformiser les icônes — non touché
* ⬜ Vérifier la cohérence des couleurs UM — non évalué (mais la bibliothèque réutilise strictement les tokens existants, aucune nouvelle couleur introduite)
* ⬜ Vérifier l'utilisation correcte du logo UM — non évalué

**Explicitement laissé de côté** : migrer les ~60 pages restantes vers ces composants. La bibliothèque existe et est prête à être adoptée progressivement ; l'appliquer partout d'un coup aurait été un refactor visuel massif avec un risque de régression que cette passe (dont la contrainte explicite était "aucune régression n'est acceptable") ne justifiait pas.

---

# 🟠 9. ⏳ Skeleton / chargement

*Fait le 2026-09-19 pour les pages prioritaires, puis étendu le 2026-09-20 à toutes les pages ayant un vrai chargement de données asynchrone (27 pages au total, testées en navigateur réel — voir bilan détaillé plus bas). Les pages sans fetch asynchrone (formulaires purs, contenu statique) n'ont volontairement pas de skeleton, il n'y a rien à y remplacer.*

* ✅ Skeleton Dashboard — `admin-rh/Dashboard.jsx` et `personnel/Dashboard.jsx` (2026-09-20)
* ✅ Skeleton liste personnel — `Personnel.jsx`, `SkeletonTable`, vérifié en navigateur (apparaît pendant le chargement, disparaît une fois les données arrivées)
* ✅ Skeleton fiche personnel — `Profil.jsx`, skeleton composé (avatar + bandeau + 2 cartes) reproduisant la structure réelle de la page
* ✅ Skeleton carrière — `Carriere.jsx` (admin) et `MaCarriere.jsx` (personnel), `SkeletonPage` ; `ParametresCarriere.jsx` (onglets Paramètres + Grilles indiciaires) ajouté le 2026-09-20
* ✅ Skeleton contrats — `Contrats.jsx` (admin) et `MesContrats.jsx` (personnel), `SkeletonCard`
* ✅ Skeleton congés — `CongesAdmin.jsx`, `Conges.jsx`, `ValidationEquipe.jsx`
* ✅ Skeleton notifications — `NotificationsPage.jsx` (2026-09-20)
* ✅ Skeleton utilisateurs — pages superadmin `Comptes.jsx`, `Corbeille.jsx`, `Permissions.jsx` (`SkeletonTable`), `ApparenceSite.jsx` (2026-09-20)
* ✅ Skeleton documents — `MesDocuments.jsx` ; `DocumentsAdmin.jsx`, `DemandesDocuments.jsx` ajoutés le 2026-09-20
* ✅ Autres pages ajoutées le 2026-09-20 : `ComptesEnAttente.jsx`, `Invitations.jsx`, `Historique.jsx`, `GestionFonctions.jsx`, `EnvoyerNotification.jsx`, `MonEquipe.jsx`, `DocumentImprimable.jsx`, `FicheDemande.jsx`
* ✅ Vérifier qu'aucune page importante reste blanche pendant le chargement — plus aucun texte "Chargement..." dans `client/src/pages` (vérifié par recherche exhaustive) ; les pages restées sans skeleton (`Login.jsx`, `Register.jsx`, `Parametres.jsx` et ses onglets, `aide/*`...) n'ont aucun fetch asynchrone au chargement, donc rien à skeletoniser

---

# 🟠 10. 📭 États vides

*Statut vérifié le 2026-09-19 : déjà fait, rien à faire.*

* ✅ Aucun contrat
* ✅ Aucun événement carrière
* ✅ Aucune situation historique
* ✅ Aucune notification
* ✅ Aucun congé
* ✅ Aucun document
* ✅ Aucun résultat de recherche

Chaque liste échantillonnée pendant l'audit associe déjà `length === 0` à un message clair ("Aucun événement enregistré", etc.).

---

# 🟠 11. ⚠️ Gestion des erreurs

*Fait le 2026-09-19 pour l'infrastructure + les 7 fichiers `services/*.js` des pages prioritaires ; pas les 17 autres fichiers de service.*

* 🟡 Uniformiser les erreurs API — `client/src/utils/apiError.js` créé (`makeApiError(res, data, fallback)`, priorité : message métier du backend > phrase fixe pour 401/403/404/409/500 > fallback existant du service > générique) ; appliqué à `personnelApi.js`, `carriereApi.js`, `contratApi.js`, `congeApi.js`, `situationAdministrativeApi.js`, `parametreCarriereApi.js`, `documentApi.js`, `fileDownload.js` (56 sites migrés) — **pas** aux 17 autres fichiers `services/*.js` (auth, notifications, organisation, comptes...), qui gardent leur `throw new Error(...)` d'origine, fonctionnellement inchangé
* ✅ Erreurs réseau — "Impossible de contacter le serveur. Vérifiez votre connexion." (`makeNetworkError`), pour les appels migrés
* ✅ Erreurs de validation — les 4 `alert()` restants remplacés par `toast.error()` (`ApparenceSite.jsx` ×2, `Personnel.jsx`, `ParametresCarriere.jsx`)
* 🟡 Erreurs upload — inchangé en dehors des `alert()` remplacés
* 🟡 Erreurs téléchargement — `fileDownload.js` migré vers `makeApiError`/`makeNetworkError`
* ✅ 401 — `apiError.js` expose `registerUnauthorizedHandler`, câblé dans `AuthContext.jsx` : un 401 reçu en cours de session (pas seulement au chargement initial) déclenche maintenant une déconnexion propre + `toast.warning("Votre session a expiré...")`, sans toucher à l'architecture JWT existante
* ✅ 403 — "Vous n'avez pas les droits nécessaires pour effectuer cette action." en repli si le backend n'a pas fourni de message (il en fournit presque toujours un, qui reste prioritaire)
* ✅ 404 — "Ressource introuvable." en repli
* ✅ 409 — message métier du backend utilisé en priorité, comme demandé
* ✅ 500 — "Une erreur interne est survenue. Veuillez réessayer." en repli
* ⬜ Bouton "Réessayer" — non implémenté cette passe (nécessiterait de refactorer chaque page pour exposer une fonction `retry`, non fait pour rester dans le périmètre)
* ✅ Messages compréhensibles pour l'utilisateur — présentation désormais uniforme via toast pour les cas migrés ; le détail technique reste en `console.error` (jamais montré tel quel à l'utilisateur), conformément à la consigne "ne jamais masquer l'erreur réelle pendant le développement"

---

# 📦 Mission "UI partagée / toasts / erreurs / skeletons" — bilan détaillé (2026-09-19)

### UI Component Library
**Statut** : fait pour les composants listés, appliqué aux pages prioritaires uniquement.
**Emplacement** : `client/src/components/ui/` (`Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Badge`, `Card`, `Modal`, `ConfirmDialog`, `EmptyState`, `FormField`, `Table`/`TableHead`/`TableBody`/`TableRow`/`TableCell`, `Skeleton`/`SkeletonText`/`SkeletonAvatar`/`SkeletonCard`/`SkeletonTable`/`SkeletonPage`), export groupé `ui/index.js`.
**Composants réutilisés tels quels** : `PageHeader.jsx` (déjà générique, non modifié).
**Design** : aucune nouvelle couleur — réutilise `navy`/`gold`/`status-approved`/`status-pending`/`status-rejected` déjà définis dans `index.css`.
**Pages migrées** : `Personnel.jsx`, `Profil.jsx`, `Carriere.jsx`, `MaCarriere.jsx`, `Contrats.jsx`, `MesContrats.jsx`, `CongesAdmin.jsx`, `Conges.jsx`, `ValidationEquipe.jsx`, `MesDocuments.jsx`, `ApparenceSite.jsx`, `ParametresCarriere.jsx` (skeletons/toasts) + `AjouterEmployeModal.jsx`, `ModifierEmployeModal.jsx`, `Contrats.jsx` (modale non-renouvellement) migrées sur le composant `Modal` partagé.
**Non migré (volontairement)** : les ~60 autres pages gardent leurs boutons/cartes/tableaux existants tels quels.

### Toast / Error handling
**Statut** : fait.
**Architecture** : `client/src/context/ToastContext.jsx` (`ToastProvider`, monté dans `App.jsx` autour de toute l'app) + `client/src/components/ui/ToastContainer.jsx` (rendu, `aria-live="polite"`, empilement haut-droite) + `client/src/utils/toast.js` (API impérative singleton `toast.success/error/warning/info(message)`, utilisable sans hook depuis n'importe quel composant) + `useToast()` comme alternative React-idiomatique.
**Types supportés** : success, error, warning, info — chacun avec icône, couleur et durée d'auto-fermeture différenciées (erreur = 7 s, le reste 4-6 s), fermeture manuelle possible à tout moment.
**Gestion HTTP** : `client/src/utils/apiError.js` (`makeApiError`, `makeNetworkError`, `getFriendlyMessage`, `registerUnauthorizedHandler`) — voir section 11 ci-dessus pour le détail par code HTTP. Câblé dans `AuthContext.jsx` pour la déconnexion propre sur 401 en cours de session.
**Migré** : 4 `alert()` → `toast.error()` (+ `toast.success()` ajouté sur les sauvegardes qui n'avaient aucun retour visuel avant), 56 sites d'erreur API dans 7 fichiers `services/*.js` + `fileDownload.js`, 6 boutons d'action désormais protégés contre la double-soumission (`CongesAdmin.jsx`, `ValidationEquipe.jsx`, `Contrats.jsx` ×2, `Carriere.jsx`, `Personnel.jsx`).

### Skeleton loaders
**Statut** : fait pour les pages prioritaires, testé en navigateur réel (voir Tests manuels).
**Composants** : `Skeleton`, `SkeletonText`, `SkeletonAvatar`, `SkeletonCard`, `SkeletonTable`, `SkeletonPage` dans `client/src/components/ui/Skeleton.jsx`, chacun façonné sur la structure réelle de la page qui l'utilise (pas un rectangle générique).
**Pages concernées** : `Personnel.jsx` (liste), `Profil.jsx` (fiche), `Carriere.jsx`/`MaCarriere.jsx`, `Contrats.jsx`/`MesContrats.jsx`, `CongesAdmin.jsx`/`Conges.jsx`/`ValidationEquipe.jsx`, `MesDocuments.jsx`.
**Hors périmètre** : Dashboard (exclu explicitement de la mission), notifications, pages superadmin (comptes/permissions/corbeille).

### Éléments volontairement laissés en dehors du périmètre
- Migration des ~60 pages restantes vers les composants UI partagés (bibliothèque prête, adoption progressive recommandée).
- Bouton "Réessayer" générique sur les erreurs.
- Sections responsive/tablette non corrigées (`Conges.jsx`, `FicheDemande.jsx`, `Personnel.jsx`, `DocumentsAdmin.jsx` gardent leurs grilles fixes).
- Dashboards (exclu explicitement par la consigne pour la mission du 2026-09-19 ; skeletons ajoutés le 2026-09-20 sur demande explicite, sans autre changement fonctionnel).
- Sessions serveur (exclu explicitement par la consigne — confirmé architecturalement absent, nécessiterait de changer l'authentification JWT, ce qui était explicitement interdit).

---

# 📦 Extension skeleton loaders + réparation d'accès — bilan (2026-09-20)

### 1. Extension des skeleton loaders à 27 pages
Sur demande explicite ("ajoute le skeleton à toutes les pages, vraiment toutes"), les 17 pages restantes ayant un chargement de données asynchrone réel ont été skeletonnées, en plus des 10 déjà faites le 2026-09-19 — total **27 pages** :
`admin-rh/Dashboard.jsx`, `personnel/Dashboard.jsx`, `ComptesEnAttente.jsx`, `DemandesDocuments.jsx`, `DocumentsAdmin.jsx`, `EnvoyerNotification.jsx`, `GestionFonctions.jsx`, `Historique.jsx`, `Invitations.jsx`, `ParametresCarriere.jsx` (les 2 onglets), `NotificationsPage.jsx`, `MonEquipe.jsx`, `DocumentImprimable.jsx`, `FicheDemande.jsx`, `superadmin/Comptes.jsx`, `superadmin/Corbeille.jsx`, `superadmin/Permissions.jsx`, `superadmin/ApparenceSite.jsx`.
Chaque skeleton est façonné sur la structure réelle de sa page (cartes, tableau, avatar, liste...), pas un rectangle générique. Les pages sans fetch asynchrone (`Login.jsx`, `Register.jsx`, `Parametres.jsx` et ses onglets, `aide/*`) n'ont volontairement aucun skeleton — il n'y a rien à y remplacer.

### 2. Réparation de l'accès aux pages / sidebar
**Cause identifiée** : la table PostgreSQL `role_permissions` s'est retrouvée entièrement vide (0 ligne), sans lien avec ce chantier — vérifié par diff nul sur `Sidebar.jsx`/`PermissionContext.jsx` (jamais modifiés cette session) et par absence de toute requête destructrice sur cette table dans les logs PostgreSQL et dans tous les scripts de test de la session. Conséquence : aucun rôle, y compris SUPERADMIN, n'avait plus aucune permission active, donc la sidebar n'affichait quasiment plus rien (un seul onglet visible selon le rôle), et SUPERADMIN ne pouvait même plus accéder à sa propre page "Rôles & permissions" pour se réparer lui-même.
**Réparation effectuée** (après validation utilisateur) : permissions par défaut réinsérées dans `role_permissions`, basées sur les clés réellement référencées dans `menuConfig.js` (pas une invention arbitraire) — SUPERADMIN 25 permissions (toutes), ADMIN_RH 14, PE 7, PAT 7. Chaque insertion tracée dans `activity_log` (`permission_modifiee`).
**Aucune modification de code** n'a été nécessaire pour cette réparation — uniquement des données.

### 3. Vérification des permissions par rôle (comptes jetables, API directe)
- **PE** → `GET /api/personnel` → **403** confirmé (permission non accordée à PE, comportement attendu)
- **ADMIN_RH** → `GET /api/personnel` → **200** confirmé (permission restaurée)
- **SUPERADMIN** → vérifié indirectement via le rendu de la sidebar complète (Admin RH + Super Administration, ≥12 entrées) et l'accès sans erreur aux 4 pages `superadmin/*` ; pas de test API direct supplémentaire au-delà de ça
- **PAT** → non testé séparément de PE cette passe (même jeu de 7 permissions que PE, aucune raison technique de se comporter différemment) ; seul le rendu de la sidebar "Mon espace" a été vérifié via le compte PE

### 4. Tests effectués
- `npm test` (backend) → **13/13 ✅**
- `npm run build` (client) → **✅**, aucun import cassé
- `npx eslint src/pages` → aucune erreur nouvelle (résidu `react-hooks/set-state-in-effect` confirmé préexistant, présent aussi dans des fichiers jamais touchés comme `Login.jsx`)
- Tests navigateur réels (Chrome headless isolé, piloté en CDP, 4 comptes jetables `*_smoke_9999@example.test`) → **20/20 ✅** : sidebar ADMIN_RH/SUPERADMIN/PE, rendu sans erreur des 8 pages ADMIN_RH + 4 pages SUPERADMIN + 2 pages PE nouvellement skeletonnées, skeleton effectivement visible pendant un chargement réseau ralenti sur `Permissions.jsx` (capture d'écran), contrôle croisé des permissions API (403/200 ci-dessus)

### 5. Données métier réelles
Aucune donnée métier réelle n'a été modifiée. Les 4 comptes jetables (matricule `999941`/`999942`, emails `*_smoke_9999@example.test`) et leurs lignes `personnel`/`users` ont été créés puis intégralement supprimés après les tests — vérifié par requête de comptage (0 ligne restante). Les 6 utilisateurs réels et leurs données sont intacts (vérifié après coup). Seule modification de données réelle : le repeuplement de `role_permissions` (point 2), qui restaure un état fonctionnel plutôt que de modifier des données métier existantes.

### 6. Ce qui reste réellement à faire
- Configurer précisément les permissions ADMIN_RH/PE/PAT via la page "Rôles & permissions" selon les règles métier exactes de l'université (le jeu de permissions restauré est un défaut raisonnable basé sur `menuConfig.js`, pas une validation métier officielle) — SUPERADMIN peut le faire dès maintenant.
- Identifier la cause racine de la vidange de `role_permissions` (non déterminée avec certitude — aucune trace dans les logs applicatifs ni PostgreSQL disponibles).
- Vérifier séparément un compte PAT réel (non testé isolément cette passe, seul PE l'a été).
- Le reste du périmètre non couvert (migration des ~60 pages restantes vers les composants UI, bouton "Réessayer", responsive tablette) est inchangé par rapport au bilan du 2026-09-19 ci-dessus.

---

# 🟠 12. ⚙️ Paramètres — finalisation

*Statut vérifié le 2026-09-19. Plus avancé que la checklist ne le suggérait, mais 1 point (sessions) est une vraie limite d'architecture, pas un oubli.*

* 🟡 Paramètres de sécurité — seul le changement de mot de passe est réel ; rien au-delà (pas de 2FA, pas d'alertes de connexion)
* ✅ Gestion du mot de passe — fonctionnel, vérifie l'ancien mot de passe, logué dans l'audit
* ⬜ Gestion des sessions — **structurellement absent, pas juste "à coder"** : l'authentification est un JWT sans état (aucune table de sessions/refresh tokens côté serveur), donc "lister/révoquer les sessions actives" n'a rien à lire. L'UI actuelle affiche seulement le user-agent du navigateur courant, sans appel serveur. Implémenter ceci correctement veut dire ajouter une table de sessions et un mécanisme de révocation au milieu d'authentification — un changement d'architecture d'authentification, pas une simple case à cocher. **Non fait cette passe**, recommandé comme décision à prendre séparément plutôt que de le faire à la hâte au milieu d'un gros lot de tâches
* 🟡 Préférences de notifications — l'UI existe et fonctionne, mais uniquement en `localStorage` : rien côté serveur ne lit ces préférences, donc elles ne filtrent aucune notification réellement envoyée. Pas corrigé cette passe (implique de faire lire `notificationService.js` une table de préférences par utilisateur)
* 🟡 Préférences d'affichage — même limite (localStorage uniquement)
* 🟡 Accessibilité — idem
* 🟡 Langue — toggle présent, mais l'anglais est explicitement marqué "bientôt disponible" ; aucune vraie infrastructure i18n
* 🟡 Paramètres système — la partie "apparence du site" (nom/logo/couleurs/textes) est réelle et persistée en base ; la partie "Fonctionnalités/Maintenance" est entièrement figée en dur dans le code (`SystemeTabs.jsx`)
* ✅ Paramètres utilisateurs
* ✅ Paramètres rôles/permissions — désormais aussi journalisé dans l'audit (corrigé cette passe)
* ✅ Journal/audit

---

# 🟡 13. 📊 Dashboard — finalisation

*Statut vérifié le 2026-09-19. Non touché cette passe (chantier de développement à part entière, pas des corrections ponctuelles) — mais l'audit a établi précisément ce qui est réel vs manquant, utile pour prioriser une prochaine passe.*

### Admin RH

* ✅ Statistiques réellement connectées à la BDD — vérifié : vraies requêtes SQL, pas de valeurs figées
* ✅ Contrats bientôt expirés
* ⬜ Contrats expirés — pas de compteur distinct des "bientôt expirés" (30 jours seulement)
* 🟡 Statistiques PAT/PE/ELD — PE et PAT réels, **ELD absent** (n'existe que comme valeur d'un champ `corps`, jamais agrégé)
* 🟡 Événements RH importants — seulement le flux échéances + demandes de congé récentes, rien de plus large
* 🟡 Actions rapides — un seul lien ("Notifier"), pas un vrai panneau d'actions

### Personnel

* ⬜ Situation actuelle — absent du dashboard (existe seulement sur `MaCarriere.jsx`)
* ⬜ Contrat actuel — absent du dashboard (existe seulement sur `MesContrats.jsx`)
* ⬜ Date d'expiration — absent du dashboard
* ⬜ Indice — absent du dashboard
* ⬜ Événements carrière — absent du dashboard
* ⬜ Documents — absent du dashboard
* 🟡 Actions rapides — présentes mais génériques (raccourcis statiques Profil/Congés/Notifications), pas connectées aux données ci-dessus

### Super Admin

* ⬜ Vue système — **aucun dashboard Super Admin dédié n'existe** ; le rôle réutilise tel quel le dashboard Admin RH
* 🟡 Statistiques utilisateurs — seulement les chiffres génériques partagés avec Admin RH, rien de spécifique au rôle Super Admin
* ✅ Comptes en attente — réel (carte partagée avec Admin RH)
* ⬜ Rôles — existe comme page à part (`Permissions.jsx`) mais jamais résumé sur un dashboard
* ⬜ Permissions — idem
* ⬜ Audit — idem (`Historique.jsx` existe, non résumé sur un dashboard)
* ⬜ Sécurité — absent
* ⬜ Maintenance — absent, et la donnée sous-jacente est de toute façon figée en dur (voir section 12)

---

# 🟡 14. 📝 Journal d'audit

*Statut vérifié le 2026-09-19. Déjà largement fait ; 2 vrais trous trouvés et corrigés (connexion, changement de permission).*

* ✅ Enregistrer les actions importantes
* ✅ Connexion/déconnexion — **corrigé cette passe** : la connexion n'était pas loguée, c'est fait maintenant (`authService.js`). La déconnexion n'existe pas comme concept dans cette architecture (JWT sans état, pas de route `/logout`), donc rien à loguer côté serveur pour ça
* ✅ Création
* ✅ Modification
* ✅ Suppression
* ✅ Restauration
* ✅ Modification carrière
* ✅ Modification situation
* ✅ Modification indice
* ✅ Gestion contrat
* ✅ Renouvellement
* 🟡 Changement de rôle — n'existe pas comme fonctionnalité dans ce projet (le rôle d'un utilisateur n'est jamais modifié après sa création), donc rien à loguer ici ; à ne pas confondre avec le changement de fonction/grade qui, lui, est déjà logué
* ✅ Changement de permission — **corrigé cette passe** : n'était pas logué (`permissionController.js`), l'est maintenant
* ✅ Afficher qui a effectué l'action
* ✅ Afficher date/heure
* ✅ Interface de consultation de l'audit — `Historique.jsx`, filtrage côté client seulement (pas de filtre serveur au-delà de `limit`)

---

# 🟡 15. 🗄️ Vérification BDD

*Statut vérifié le 2026-09-19 (lecture de toutes les migrations + requêtes directes sur la DB réelle). 1 vrai trou trouvé et corrigé.*

* ✅ Vérifier les nouvelles tables/colonnes liées à la carrière
* ✅ Vérifier situation administrative
* ✅ Vérifier indices
* ✅ Vérifier contrats — **bug réel trouvé et corrigé** : aucune contrainte n'empêchait deux contrats "actif" simultanés pour la même personne (migration 009, `uniq_contrats_actif_par_personnel`), vérifié qu'aucune donnée réelle existante ne la violait avant de l'ajouter
* ✅ Vérifier renouvellements
* ✅ Vérifier notifications
* ✅ Vérifier audit
* ✅ Vérifier toutes les clés étrangères — toutes explicites avec `ON DELETE` géré (`SET NULL` pour les colonnes "auteur", `CASCADE` pour les colonnes "propriétaire")
* ✅ Vérifier contraintes `UNIQUE`
* ✅ Vérifier contraintes `NOT NULL`
* ✅ Vérifier les index
* ✅ Vérifier l'intégrité des données — aucune incohérence trouvée sur la DB réelle (ex. aucun personnel avec 2 contrats actifs avant l'ajout de la contrainte)
* 🟡 Tester les suppressions/modifications en cascade — vérifié pour contrats/carrière/situations/congés lors du nettoyage des comptes de test cette passe, pas systématiquement sur toutes les tables du projet

---

# 🟡 16. 🔌 API Backend

*Statut vérifié le 2026-09-19 (revue de toutes les routes mutantes du backend).*

* ✅ Vérifier toutes les routes carrière
* ✅ Vérifier routes situation administrative
* ✅ Vérifier routes indices
* ✅ Vérifier routes contrats
* ✅ Vérifier routes renouvellement
* ✅ Vérifier routes notifications
* ✅ Vérifier routes audit
* ✅ Vérifier validation des données
* 🟡 Vérifier les permissions de chaque endpoint — presque tout est `requireAuth` + `requirePermission`. 2 routes congés (`GET /pending-equipe`, `POST /:id/review-intermediaire`) n'ont que `requireAuth`, la vérification réelle (le demandeur est bien le validateur assigné) se fait dans le service. Fonctionnellement correct et vérifié par le code, mais fragile si le service change un jour — **non modifié cette passe** pour ne pas casser l'accès légitime des chefs de service (il n'existe pas de permission dédiée pour "valider les congés de son équipe" à réutiliser sans risque)
* ✅ Vérifier les réponses d'erreur

---

# 🟡 17. 🔒 Sécurité finale

*Statut vérifié le 2026-09-19. Le point le plus important de toute cette passe : une vraie fuite de documents a été trouvée et corrigée.*

* ✅ Vérifier que `.env` n'est pas envoyé sur GitHub
* ✅ Vérifier les permissions backend
* ✅ Vérifier l'accès aux documents — **faille réelle trouvée et corrigée** : les justificatifs de congés, de carrière, de situations administratives et les diplômes étaient servis sans aucune authentification via `express.static` (tout `/uploads/...` était public — n'importe qui avec le lien, même déconnecté, pouvait les lire). Seuls les contrats faisaient déjà les choses correctement. Corrigé : ces 3 types de documents passent maintenant par une route authentifiée avec vérification propriétaire/RH (comme les contrats) ; seules les photos de profil restent publiques (choix documenté : faible sensibilité, affichées comme avatars dans toute l'app, noms de fichiers aléatoires). Vérifié en direct : l'ancien lien statique renvoie désormais 404
* ✅ Vérifier l'accès aux contrats
* ✅ Vérifier l'accès aux données personnelles
* ✅ Vérifier les uploads — **renforcé cette passe** : en plus de l'extension déclarée, le contenu réel du fichier (magic bytes) est maintenant vérifié pour contrats/carrière/situations administratives/congés (les photos de profil le faisaient déjà) ; un fichier renommé en `.pdf` qui n'est pas un vrai PDF est désormais rejeté, vérifié en direct
* ✅ Vérifier les tailles de fichiers — déjà en place partout (limites `multer`)
* ✅ Vérifier les types MIME — voir "Vérifier les uploads" ci-dessus
* ✅ Vérifier les données sensibles dans les logs — aucune fuite de mot de passe/token trouvée dans les `console.log`/`console.error`

---

# 🟡 18. 🐛 Tests & corrections

*Cette passe elle-même : tests live sur serveur isolé (port 4001), comptes jetables créés/utilisés/nettoyés, jamais sur l'environnement réel de l'utilisateur.*

* ✅ Tester chaque fonctionnalité modifiée cette passe — contrats, situations administratives, carrière, congés, permissions, connexion : tous testés en direct (24/24 vérifications passées, comptes nettoyés après)
* 🟡 Tester le workflow complet d'un personnel — testé par morceaux (contrat + situation + carrière + congé), pas un unique scénario bout-en-bout continu
* 🟡 Tester un changement de situation — code non modifié cette passe, non re-testé (déjà validé lors d'une passe antérieure)
* ✅ Tester un changement d'indice — fait lors de la mission grilles indiciaires précédente
* ✅ Tester un renouvellement — testé en direct cette passe, bug d'ordonnancement trouvé et corrigé
* 🟡 Tester un non-renouvellement — code non modifié cette passe, non re-testé
* 🟡 Tester les notifications — code non modifié cette passe (hormis la journalisation), non re-testé
* ✅ Tester les permissions — matrice complète testée en direct : propriétaire OK, tiers refusé (403), RH OK, SUPERADMIN OK (bug corrigé)
* ✅ Tester l'accès aux PDF — testé en direct sur les 4 types de documents + rejet d'un faux PDF
* 🟡 Tester les trois rôles — PE testé (propriétaire et tiers), ADMIN_RH et SUPERADMIN testés ; PAT non testé spécifiquement (mêmes chemins de code que PE, risque faible mais non vérifié)
* ⬜ Vérifier la console navigateur — pas de test navigateur cette passe (vérifié uniquement par API directe + build)
* ✅ Vérifier les erreurs backend — logs du serveur de test surveillés pendant tous les tests, aucune erreur inattendue
* ✅ Vérifier PostgreSQL — migration 009 appliquée et vérifiée sur la DB réelle, `npm test` (13/13) et `npm run build` (client) passent

---

# 🟢 19. 📚 Documentation finale

* ⬜ Mettre à jour README
* ⬜ Architecture du projet
* ⬜ Installation
* ⬜ Configuration
* ⬜ Variables `.env`
* ⬜ Fonctionnalités
* ⬜ Rôles
* ⬜ Permissions
* ⬜ API
* ⬜ Structure PostgreSQL
* ⬜ Diagramme UML
* ⬜ Workflow carrière
* ⬜ Workflow contrat
* ⬜ Workflow renouvellement
* ⬜ Guide d'utilisation

---

# 🟢 20. 🚀 Validation finale

* ⬜ `npm run build` frontend OK
* ⬜ Backend démarre sans erreur
* ⬜ PostgreSQL fonctionne
* ⬜ Aucun import cassé
* ⬜ Aucune erreur console importante
* ⬜ Aucune erreur API importante
* ⬜ Tous les rôles fonctionnent
* ⬜ Responsive vérifié
* ⬜ Documents/PDF vérifiés
* ⬜ Permissions vérifiées
* ⬜ README finalisé
* ⬜ GitHub propre
* ⬜ Dernier commit
* ⬜ Déploiement final

---

## 🎯 Les 10 prochaines tâches prioritaires

Si tu veux simplement savoir **quoi attaquer maintenant**, je mettrais :

1. ⬜ **Finaliser Situation administrative**
2. ⬜ **Finaliser Gestion des indices**
3. ⬜ **Finaliser Contrats**
4. ⬜ **Finaliser Renouvellement / Non-renouvellement**
5. ⬜ **Finaliser Notifications automatiques**
6. ⬜ **Nettoyer la Sidebar**
7. ⬜ **Responsive + Sidebar mobile**
8. ⬜ **Corriger le 403 des PDF**
9. ⬜ **Audit BDD/API + sécurité**
10. ⬜ **Tests complets + corrections**

C'est cette liste que je considérerais comme **le vrai reste à faire**, plutôt que de reprendre les fonctionnalités que tu as déjà validées.
