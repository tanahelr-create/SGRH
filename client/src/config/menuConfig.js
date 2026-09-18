import {
  LayoutDashboard, Users, UserPlus, UserCheck, Bell, Briefcase, GitBranch, SlidersHorizontal,
  CalendarClock, FileText, FileStack, History, ShieldCheck, Trash2, KeyRound, Palette,
  UserRound, Award, Users2, ClipboardCheck, FolderOpen, HelpCircle, Info, BookOpen,
} from 'lucide-react';

export const menuConfig = {
  ADMIN_RH: [
    {
      title: 'Gestion des Ressources Humaines',
      items: [
        { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'view_dashboard_admin' },
        { label: 'Personnel', path: '/admin/personnel', icon: Users, permission: 'view_personnel' },
        { label: 'Inviter un personnel', path: '/admin/invitations', icon: UserPlus, permission: 'send_registration_link' },
        { label: 'Comptes en attente', path: '/admin/comptes-attente', icon: UserCheck, permission: 'view_pending_accounts' },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell, permission: 'send_notification' },
        { label: 'Fonctions', path: '/admin/fonctions', icon: Briefcase, permission: 'manage_fonctions' },
        { label: 'Carrière', path: '/admin/carriere', icon: GitBranch, permission: 'manage_fonctions' },
        { label: 'Paramètres carrière', path: '/admin/parametres-carriere', icon: SlidersHorizontal, permission: 'manage_parametres_carriere' },
        { label: 'Congés', path: '/admin/conges', icon: CalendarClock, permission: 'view_conges_admin' },
        { label: 'Documents administratifs', path: '/admin/documents', icon: FileText, permission: 'manage_documents' },
        { label: 'Demandes de documents', path: '/admin/demandes-documents', icon: FolderOpen, permission: 'manage_documents' },
        { label: 'Historique', path: '/admin/historique', icon: History, permission: 'view_historique' },
      ],
    },
  ],
  SUPERADMIN: [
    {
      title: 'Administration',
      items: [
        { label: 'Comptes', path: '/superadmin/comptes', icon: ShieldCheck, permission: 'manage_accounts' },
        { label: 'Corbeille', path: '/superadmin/corbeille', icon: Trash2, permission: 'manage_corbeille' },
        { label: 'Permissions', path: '/superadmin/permissions', icon: KeyRound, permission: 'manage_permissions' },
        { label: 'Apparence', path: '/superadmin/apparence', icon: Palette, permission: 'manage_site_texts' },
      ],
    },
  ],
  PE: [
    {
      title: null,
      items: [
        { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, permission: null },
        { label: 'Mon profil', path: '/profil', icon: UserRound, permission: 'view_profil' },
        { label: 'Ma carrière', path: '/carriere', icon: Award, permission: 'view_profil' },
        { label: 'Congés', path: '/conges', icon: CalendarClock, permission: 'view_mes_conges' },
        { label: 'Mon équipe', path: '/mon-equipe', icon: Users2, permission: null, showIf: (u) => u?.fonction === 'Chef de service' || u?.fonction === 'Responsable/Directeur' },
        { label: 'Validation équipe', path: '/validation-equipe', icon: ClipboardCheck, permission: null, showIf: (u) => u?.fonction === 'Chef de service' || u?.fonction === 'Responsable/Directeur' },
        { label: 'Mes documents', path: '/mes-documents', icon: FileStack, permission: 'demander_document' },
      ],
    },
    {
      title: 'Aide',
      items: [
        { label: 'Par où commencer', path: '/aide/commencer', icon: Info, permission: null },
        { label: 'Vos droits', path: '/aide/droits', icon: HelpCircle, permission: null },
        { label: 'Les procédures', path: '/aide/procedures', icon: BookOpen, permission: null },
      ],
    },
  ],
  PAT: [
    {
      title: null,
      items: [
        { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, permission: null },
        { label: 'Mon profil', path: '/profil', icon: UserRound, permission: 'view_profil' },
        { label: 'Ma carrière', path: '/carriere', icon: Award, permission: 'view_profil' },
        { label: 'Congés', path: '/conges', icon: CalendarClock, permission: 'view_mes_conges' },
        { label: 'Mon équipe', path: '/mon-equipe', icon: Users2, permission: null, showIf: (u) => u?.fonction === 'Chef de service' || u?.fonction === 'Responsable/Directeur' },
        { label: 'Validation équipe', path: '/validation-equipe', icon: ClipboardCheck, permission: null, showIf: (u) => u?.fonction === 'Chef de service' || u?.fonction === 'Responsable/Directeur' },
        { label: 'Mes documents', path: '/mes-documents', icon: FileStack, permission: 'demander_document' },
      ],
    },
    {
      title: 'Aide',
      items: [
        { label: 'Par où commencer', path: '/aide/commencer', icon: Info, permission: null },
        { label: 'Vos droits', path: '/aide/droits', icon: HelpCircle, permission: null },
        { label: 'Les procédures', path: '/aide/procedures', icon: BookOpen, permission: null },
      ],
    },
  ],
};