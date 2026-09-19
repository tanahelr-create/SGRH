Oui. En me basant sur **l’état actuel du SGRH tel qu’on l’a suivi ensemble**, je retire les éléments que tu as déjà terminés. Voici uniquement la **checklist des tâches restantes**.

# 🔴 À FAIRE — SGRH

## 1. 🏛️ Carrière & situation administrative

* ⬜ Finaliser la **situation administrative** comme bloc indépendant de la timeline carrière
* ⬜ Garantir qu'une seule situation soit ouverte à la fois
* ⬜ Fermer automatiquement l'ancienne situation lors de la création d'une nouvelle
* ⬜ Gérer `date_debut` / `date_fin`
* ⬜ Empêcher les chevauchements de situations
* ⬜ Ajouter le **motif du changement**
* ⬜ Afficher clairement la situation actuelle
* ⬜ Afficher l'historique complet des situations
* ⬜ Vérifier modification/suppression d'une situation
* ⬜ Tester tous les changements de situation

---

## 2. 🔢 Gestion des indices

* ⬜ Finaliser la gestion de l'indice
* ⬜ Gérer la partie numérique (`950`)
* ⬜ Gérer le code (`FOP`)
* ⬜ Associer l'indice à la situation/carrière
* ⬜ Afficher l'indice actuel
* ⬜ Conserver l'historique des indices
* ⬜ Gérer les changements d'indice
* ⬜ Vérifier qu'un **simple renouvellement de contrat ne modifie pas automatiquement l'indice**

---

## 3. 📄 Contrats ELD / PAT / PE

* ⬜ Finaliser l'import des contrats
* ⬜ Accepter uniquement les PDF
* ⬜ Sécuriser le stockage des contrats
* ⬜ Afficher les contrats sur la fiche personnel
* ⬜ Permettre au RH de télécharger un contrat
* ⬜ Permettre au personnel de télécharger **uniquement son propre contrat**
* ⬜ Empêcher l'accès au contrat d'un autre personnel
* ⬜ Gérer le remplacement d'un contrat
* ⬜ Conserver l'historique des contrats
* ⬜ Corriger définitivement le problème **403 Forbidden** lié aux documents/PDF

---

## 4. 🔄 Renouvellement des contrats

* ⬜ Détecter les contrats arrivant prochainement à échéance
* ⬜ Afficher les contrats concernés au RH
* ⬜ Workflow de renouvellement
* ⬜ Workflow de renouvellement avec renégociation
* ⬜ Workflow de non-renouvellement
* ⬜ Demander un motif obligatoire pour le non-renouvellement
* ⬜ Enregistrer le motif
* ⬜ Conserver l'historique des décisions
* ⬜ Créer le nouveau contrat après renouvellement
* ⬜ Clôturer correctement l'ancien contrat

---

# 🔴 5. 🔔 Notifications RH

* ⬜ Finaliser les notifications automatiques
* ⬜ Notification d'approche d'expiration d'un contrat
* ⬜ Notification de contrat expiré
* ⬜ Notification de renouvellement
* ⬜ Notification de non-renouvellement
* ⬜ Notification de changement de situation administrative
* ⬜ Notification des événements RH importants
* ⬜ Vérifier les destinataires
* ⬜ Badge compteur non-lu
* ⬜ Marquer comme lu
* ⬜ Tout marquer comme lu
* ⬜ Accès depuis la cloche vers l'élément concerné

---

# 🔴 6. 🧭 Nettoyage de la Sidebar

* ⬜ Faire l'inventaire des entrées actuelles
* ⬜ Supprimer les doublons
* ⬜ Regrouper les fonctionnalités similaires
* ⬜ Retirer les éléments secondaires inutiles
* ⬜ Adapter la sidebar selon le rôle
* ⬜ Éviter d'avoir les notifications comme élément inutilement séparé
* ⬜ Vérifier que la navigation reste claire après le nettoyage

---

# 🟠 7. 📱 Responsive & Sidebar mobile

* ⬜ Adapter les pages aux écrans laptop
* ⬜ Vérifier 1366×768
* ⬜ Vérifier les grands écrans
* ⬜ Adapter aux tablettes
* ⬜ Adapter aux smartphones
* ⬜ Sidebar rétractable
* ⬜ Menu hamburger sur mobile
* ⬜ Fermeture de la sidebar après navigation
* ⬜ Adapter les tableaux au mobile
* ⬜ Adapter les formulaires
* ⬜ Adapter les modales
* ⬜ Éliminer les débordements horizontaux

---

# 🟠 8. 🎨 Harmonisation Design / UX

* ⬜ Revoir les pages qui apparaissent trop petites
* ⬜ Recentrer correctement les contenus
* ⬜ Améliorer l'utilisation de l'espace disponible
* ⬜ Uniformiser les boutons
* ⬜ Uniformiser les cartes
* ⬜ Uniformiser les tableaux
* ⬜ Uniformiser les formulaires
* ⬜ Uniformiser les modales
* ⬜ Uniformiser les badges
* ⬜ Uniformiser les icônes
* ⬜ Vérifier la cohérence des couleurs UM
* ⬜ Vérifier l'utilisation correcte du logo UM

---

# 🟠 9. ⏳ Skeleton / chargement

* ⬜ Skeleton Dashboard
* ⬜ Skeleton liste personnel
* ⬜ Skeleton fiche personnel
* ⬜ Skeleton carrière
* ⬜ Skeleton contrats
* ⬜ Skeleton congés
* ⬜ Skeleton notifications
* ⬜ Skeleton utilisateurs
* ⬜ Vérifier qu'aucune page importante reste blanche pendant le chargement

---

# 🟠 10. 📭 États vides

Ajouter un état propre lorsque les données n'existent pas :

* ⬜ Aucun contrat
* ⬜ Aucun événement carrière
* ⬜ Aucune situation historique
* ⬜ Aucune notification
* ⬜ Aucun congé
* ⬜ Aucun document
* ⬜ Aucun résultat de recherche

---

# 🟠 11. ⚠️ Gestion des erreurs

* ⬜ Uniformiser les erreurs API
* ⬜ Erreurs réseau
* ⬜ Erreurs de validation
* ⬜ Erreurs upload
* ⬜ Erreurs téléchargement
* ⬜ 401
* ⬜ 403
* ⬜ 404
* ⬜ 500
* ⬜ Bouton "Réessayer"
* ⬜ Messages compréhensibles pour l'utilisateur

---

# 🟠 12. ⚙️ Paramètres — finalisation

La structure a déjà été définie. Il reste à vérifier/implémenter les éléments qui ne sont pas encore fonctionnels :

* ⬜ Paramètres de sécurité
* ⬜ Gestion du mot de passe
* ⬜ Gestion des sessions
* ⬜ Préférences de notifications
* ⬜ Préférences d'affichage
* ⬜ Accessibilité
* ⬜ Langue
* ⬜ Paramètres système
* ⬜ Paramètres utilisateurs
* ⬜ Paramètres rôles/permissions
* ⬜ Journal/audit

**Établissements reste volontairement absent des paramètres.**

---

# 🟡 13. 📊 Dashboard — finalisation

### Admin RH

* ⬜ Statistiques réellement connectées à la BDD
* ⬜ Contrats bientôt expirés
* ⬜ Contrats expirés
* ⬜ Statistiques PAT/PE/ELD
* ⬜ Événements RH importants
* ⬜ Actions rapides

### Personnel

* ⬜ Situation actuelle
* ⬜ Contrat actuel
* ⬜ Date d'expiration
* ⬜ Indice
* ⬜ Événements carrière
* ⬜ Documents
* ⬜ Actions rapides

### Super Admin

* ⬜ Vue système
* ⬜ Statistiques utilisateurs
* ⬜ Comptes en attente
* ⬜ Rôles
* ⬜ Permissions
* ⬜ Audit
* ⬜ Sécurité
* ⬜ Maintenance

---

# 🟡 14. 📝 Journal d'audit

* ⬜ Enregistrer les actions importantes
* ⬜ Connexion/déconnexion
* ⬜ Création
* ⬜ Modification
* ⬜ Suppression
* ⬜ Restauration
* ⬜ Modification carrière
* ⬜ Modification situation
* ⬜ Modification indice
* ⬜ Gestion contrat
* ⬜ Renouvellement
* ⬜ Changement de rôle
* ⬜ Changement de permission
* ⬜ Afficher qui a effectué l'action
* ⬜ Afficher date/heure
* ⬜ Interface de consultation de l'audit

---

# 🟡 15. 🗄️ Vérification BDD

* ⬜ Vérifier les nouvelles tables/colonnes liées à la carrière
* ⬜ Vérifier situation administrative
* ⬜ Vérifier indices
* ⬜ Vérifier contrats
* ⬜ Vérifier renouvellements
* ⬜ Vérifier notifications
* ⬜ Vérifier audit
* ⬜ Vérifier toutes les clés étrangères
* ⬜ Vérifier contraintes `UNIQUE`
* ⬜ Vérifier contraintes `NOT NULL`
* ⬜ Vérifier les index
* ⬜ Vérifier l'intégrité des données
* ⬜ Tester les suppressions/modifications en cascade

---

# 🟡 16. 🔌 API Backend

* ⬜ Vérifier toutes les routes carrière
* ⬜ Vérifier routes situation administrative
* ⬜ Vérifier routes indices
* ⬜ Vérifier routes contrats
* ⬜ Vérifier routes renouvellement
* ⬜ Vérifier routes notifications
* ⬜ Vérifier routes audit
* ⬜ Vérifier validation des données
* ⬜ Vérifier les permissions de chaque endpoint
* ⬜ Vérifier les réponses d'erreur

---

# 🟡 17. 🔒 Sécurité finale

* ⬜ Vérifier que `.env` n'est pas envoyé sur GitHub
* ⬜ Vérifier les permissions backend
* ⬜ Vérifier l'accès aux documents
* ⬜ Vérifier l'accès aux contrats
* ⬜ Vérifier l'accès aux données personnelles
* ⬜ Vérifier les uploads
* ⬜ Vérifier les tailles de fichiers
* ⬜ Vérifier les types MIME
* ⬜ Vérifier les données sensibles dans les logs

---

# 🟡 18. 🐛 Tests & corrections

* ⬜ Tester chaque fonctionnalité après modification
* ⬜ Tester le workflow complet d'un personnel
* ⬜ Tester un changement de situation
* ⬜ Tester un changement d'indice
* ⬜ Tester un renouvellement
* ⬜ Tester un non-renouvellement
* ⬜ Tester les notifications
* ⬜ Tester les permissions
* ⬜ Tester l'accès aux PDF
* ⬜ Tester les trois rôles
* ⬜ Vérifier la console navigateur
* ⬜ Vérifier les erreurs backend
* ⬜ Vérifier PostgreSQL

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
