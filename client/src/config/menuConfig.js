import {
  LayoutDashboard, UserPlus, UserCheck, Users, Send,
  TrendingUp, CalendarDays, Bell, History, UserCog,
  HelpCircle, ShieldCheck, FileText, Briefcase, Trash2, Palette,
  UsersRound, ClipboardCheck, FileStack,
} from 'lucide-react';

const estEncadrant = (user) =>
  user?.fonction === 'Chef de service' || user?.fonction === 'Responsable/Directeur';

export const menuConfig = {
  ADMIN_RH: [
    {
      title: null,
      items: [
        { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'view_dashboard_admin' },
        { label: 'Personnel', path: '/admin/personnel', icon: Users, permission: 'view_personnel' },
        { label: 'Inviter un personnel', path: '/admin/invitations', icon: UserPlus, permission: 'send_registration_link' },
        { label: 'Comptes en attente', path: '/admin/comptes-attente', icon: UserCheck, permission: 'view_pending_accounts' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Envoyer une notification', path: '/admin/notifications', icon: Send, permission: 'send_notification' },
        { label: 'Notifications reçues', path: '/notifications', icon: Bell, permission: 'view_notifications' },
      ],
    },
    {
      title: 'Gestion RH',
      items: [
        { label: 'Gestion des fonctions', path: '/admin/fonctions', icon: TrendingUp, permission: 'manage_fonctions' },
        { label: 'Carrière', path: '/admin/carriere', icon: Briefcase, permission: 'manage_fonctions' },
        { label: 'Congés', path: '/admin/conges', icon: CalendarDays, permission: 'view_conges_admin' },
        { label: 'Demandes de documents', path: '/admin/demandes-documents', icon: FileStack, permission: 'manage_documents' },
        { label: 'Documents administratifs', path: '/admin/documents', icon: FileStack, permission: 'manage_documents' },
        { label: 'Historique', path: '/admin/historique', icon: History, permission: 'view_historique' },
      ],
    },
  ],

  SUPERADMIN: [
    {
      title: 'Administration',
      items: [
        { label: 'Comptes', path: '/superadmin/comptes', icon: Users, permission: 'manage_accounts' },
        { label: 'Corbeille', path: '/superadmin/corbeille', icon: Trash2, permission: 'manage_corbeille' },
        { label: 'Permissions', path: '/superadmin/permissions', icon: UserCog, permission: 'manage_permissions' },
        { label: 'Apparence du site', path: '/superadmin/apparence', icon: Palette, permission: 'manage_site_texts' },
      ],
    },
  ],

  PE: [
    {
      title: null,
      items: [
        { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, permission: null },
        { label: 'Ma carrière', path: '/carriere', icon: Briefcase, permission: 'view_profil' },
        { label: 'Congés', path: '/conges', icon: CalendarDays, permission: 'view_mes_conges' },
        { label: 'Mes documents', path: '/mes-documents', icon: FileStack, permission: 'demander_document' },
        { label: 'Notifications', path: '/notifications', icon: Bell, permission: 'view_notifications' },
      ],
    },
    {
      title: 'Encadrement',
      items: [
        { label: 'Mon équipe', path: '/mon-equipe', icon: UsersRound, permission: null, showIf: estEncadrant },
        { label: 'Validation équipe', path: '/validation-equipe', icon: ClipboardCheck, permission: null, showIf: estEncadrant },
      ],
    },
    {
      title: 'Documentation',
      items: [
        { label: 'Par où commencer', path: '/aide/commencer', icon: HelpCircle, permission: null },
        { label: 'Vos droits', path: '/aide/droits', icon: ShieldCheck, permission: null },
        { label: 'Les procédures', path: '/aide/procedures', icon: FileText, permission: null },
      ],
    },
  ],

  PAT: [
    {
      title: null,
      items: [
        { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, permission: null },
        { label: 'Ma carrière', path: '/carriere', icon: Briefcase, permission: 'view_profil' },
        { label: 'Congés', path: '/conges', icon: CalendarDays, permission: 'view_mes_conges' },
        { label: 'Mes documents', path: '/mes-documents', icon: FileStack, permission: 'demander_document' },
        { label: 'Notifications', path: '/notifications', icon: Bell, permission: 'view_notifications' },
      ],
    },
    {
      title: 'Encadrement',
      items: [
        { label: 'Mon équipe', path: '/mon-equipe', icon: UsersRound, permission: null, showIf: estEncadrant },
        { label: 'Validation équipe', path: '/validation-equipe', icon: ClipboardCheck, permission: null, showIf: estEncadrant },
      ],
    },
    {
      title: 'Documentation',
      items: [
        { label: 'Par où commencer', path: '/aide/commencer', icon: HelpCircle, permission: null },
        { label: 'Vos droits', path: '/aide/droits', icon: ShieldCheck, permission: null },
        { label: 'Les procédures', path: '/aide/procedures', icon: FileText, permission: null },
      ],
    },
  ],
};
