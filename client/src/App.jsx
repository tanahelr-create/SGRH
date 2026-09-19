import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionProvider } from './context/PermissionContext';
import { TextProvider } from './context/TextContext';
import { SettingsPreferencesProvider } from './context/SettingsPreferencesContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import NotificationsPage from './pages/NotificationsPage';
import Parametres from './pages/Parametres';
import FicheDemande from './pages/FicheDemande';
import DocumentImprimable from './pages/DocumentImprimable';
import ParOuCommencer from './pages/aide/ParOuCommencer';
import VosDroits from './pages/aide/VosDroits';
import Procedures from './pages/aide/Procedures';
import Dashboard from './pages/admin-rh/Dashboard';
import Personnel from './pages/admin-rh/Personnel';
import Invitations from './pages/admin-rh/Invitations';
import ComptesEnAttente from './pages/admin-rh/ComptesEnAttente';
import EnvoyerNotification from './pages/admin-rh/EnvoyerNotification';
import GestionFonctions from './pages/admin-rh/GestionFonctions';
import Carriere from './pages/admin-rh/Carriere';
import ContratsAdmin from './pages/admin-rh/Contrats';
import ParametresCarriere from './pages/admin-rh/ParametresCarriere';
import CongesAdmin from './pages/admin-rh/CongesAdmin';
import DocumentsAdmin from './pages/admin-rh/DocumentsAdmin';
import DemandesDocuments from './pages/admin-rh/DemandesDocuments';
import Historique from './pages/admin-rh/Historique';
import ComptesSuperadmin from './pages/superadmin/Comptes';
import PermissionsSuperadmin from './pages/superadmin/Permissions';
import CorbeilleSuperadmin from './pages/superadmin/Corbeille';
import ApparenceSite from './pages/superadmin/ApparenceSite';
import PersonnelDashboard from './pages/personnel/Dashboard';
import Profil from './pages/personnel/Profil';
import MaCarriere from './pages/personnel/MaCarriere';
import MesContrats from './pages/personnel/MesContrats';
import Conges from './pages/personnel/Conges';
import MonEquipe from './pages/personnel/MonEquipe';
import ValidationEquipe from './pages/personnel/ValidationEquipe';
import MesDocuments from './pages/personnel/MesDocuments';

const ALL_ROLES = ['ADMIN_RH', 'SUPERADMIN', 'PE', 'PAT'];
const PE_PAT = ['PE', 'PAT'];
const ADMIN_OR_SUPERADMIN = ['ADMIN_RH', 'SUPERADMIN'];

function App() {
  return (
    <ThemeProvider>
      <TextProvider>
        <SettingsPreferencesProvider>
        <BrowserRouter>
          <AuthProvider>
            <PermissionProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                <Route path="/reset-password" element={<ReinitialiserMotDePasse />} />

                <Route path="/demandes/:id/fiche" element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <FicheDemande />
                  </ProtectedRoute>
                } />
                <Route path="/documents/:id" element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <DocumentImprimable />
                  </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                  <ProtectedRoute allowedRoles={ALL_ROLES} permission="view_notifications">
                    <AppShell title="Notifications" subtitle="Gestion des Ressources Humaines"><NotificationsPage /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/parametres" element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <AppShell title="Paramètres" subtitle="Gestion des Ressources Humaines"><Parametres /></AppShell>
                  </ProtectedRoute>
                } />

                <Route path="/aide/commencer" element={
                  <ProtectedRoute allowedRoles={PE_PAT}>
                    <AppShell title="Par où commencer" subtitle="Documentation"><ParOuCommencer /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/aide/droits" element={
                  <ProtectedRoute allowedRoles={PE_PAT}>
                    <AppShell title="Vos droits" subtitle="Documentation"><VosDroits /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/aide/procedures" element={
                  <ProtectedRoute allowedRoles={PE_PAT}>
                    <AppShell title="Les procédures" subtitle="Documentation"><Procedures /></AppShell>
                  </ProtectedRoute>
                } />

                <Route path="/mon-equipe" element={
                  <ProtectedRoute allowedRoles={PE_PAT}>
                    <AppShell title="Mon équipe" subtitle="Gestion des Ressources Humaines"><MonEquipe /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/validation-equipe" element={
                  <ProtectedRoute allowedRoles={PE_PAT}>
                    <AppShell title="Validation équipe" subtitle="Gestion des Ressources Humaines"><ValidationEquipe /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/mes-documents" element={
                  <ProtectedRoute allowedRoles={PE_PAT} permission="demander_document">
                    <AppShell title="Mes documents" subtitle="Gestion des Ressources Humaines"><MesDocuments /></AppShell>
                  </ProtectedRoute>
                } />

                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="view_dashboard_admin">
                    <AppShell title="Tableau de bord" subtitle="Gestion des Ressources Humaines"><Dashboard /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/personnel" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="view_personnel">
                    <AppShell title="Personnel" subtitle="Gestion des Ressources Humaines"><Personnel /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/invitations" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="send_registration_link">
                    <AppShell title="Inviter un personnel" subtitle="Gestion des Ressources Humaines"><Invitations /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/comptes-attente" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="view_pending_accounts">
                    <AppShell title="Comptes en attente" subtitle="Gestion des Ressources Humaines"><ComptesEnAttente /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/notifications" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="send_notification">
                    <AppShell title="Envoyer une notification" subtitle="Gestion des Ressources Humaines"><EnvoyerNotification /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/fonctions" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="manage_fonctions">
                    <AppShell title="Gestion des fonctions" subtitle="Gestion des Ressources Humaines"><GestionFonctions /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/carriere" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="manage_fonctions">
                    <AppShell title="Carrière" subtitle="Gestion des Ressources Humaines"><Carriere /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/contrats" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="manage_fonctions">
                    <AppShell title="Contrats" subtitle="Gestion des Ressources Humaines"><ContratsAdmin /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/parametres-carriere" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="manage_parametres_carriere">
                    <AppShell title="Paramètres de carrière" subtitle="Gestion des Ressources Humaines"><ParametresCarriere /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/conges" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="view_conges_admin">
                    <AppShell title="Congés & absences" subtitle="Gestion des Ressources Humaines"><CongesAdmin /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/documents" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="manage_documents">
                    <AppShell title="Documents administratifs" subtitle="Gestion des Ressources Humaines"><DocumentsAdmin /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/demandes-documents" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="manage_documents">
                    <AppShell title="Demandes de documents" subtitle="Gestion des Ressources Humaines"><DemandesDocuments /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/admin/historique" element={
                  <ProtectedRoute allowedRoles={ADMIN_OR_SUPERADMIN} permission="view_historique">
                    <AppShell title="Audit & journal" subtitle="Gestion des Ressources Humaines"><Historique /></AppShell>
                  </ProtectedRoute>
                } />

                <Route path="/superadmin/comptes" element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']} permission="manage_accounts">
                    <AppShell title="Gestion des comptes" subtitle="Administration système"><ComptesSuperadmin /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/superadmin/corbeille" element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']} permission="manage_corbeille">
                    <AppShell title="Corbeille" subtitle="Administration système"><CorbeilleSuperadmin /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/superadmin/permissions" element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']} permission="manage_permissions">
                    <AppShell title="Gestion des permissions" subtitle="Administration système"><PermissionsSuperadmin /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/superadmin/apparence" element={
                  <ProtectedRoute allowedRoles={['SUPERADMIN']} permission="manage_site_texts">
                    <AppShell title="Apparence du site" subtitle="Administration système"><ApparenceSite /></AppShell>
                  </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={PE_PAT}>
                    <AppShell title="Espace personnel" subtitle="Gestion des Ressources Humaines"><PersonnelDashboard /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/profil" element={
                  <ProtectedRoute allowedRoles={PE_PAT} permission="view_profil">
                    <AppShell title="Mon dossier" subtitle="Gestion des Ressources Humaines"><Profil /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/carriere" element={
                  <ProtectedRoute allowedRoles={PE_PAT} permission="view_profil">
                    <AppShell title="Ma carrière" subtitle="Gestion des Ressources Humaines"><MaCarriere /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/mes-contrats" element={
                  <ProtectedRoute allowedRoles={PE_PAT} permission="view_profil">
                    <AppShell title="Mes contrats" subtitle="Gestion des Ressources Humaines"><MesContrats /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/conges" element={
                  <ProtectedRoute allowedRoles={PE_PAT} permission="view_mes_conges">
                    <AppShell title="Mes congés & absences" subtitle="Gestion des Ressources Humaines"><Conges /></AppShell>
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </PermissionProvider>
          </AuthProvider>
        </BrowserRouter>
        </SettingsPreferencesProvider>
      </TextProvider>
    </ThemeProvider>
  );
}

export default App;