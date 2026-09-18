import {
  UserRound, ShieldCheck, MonitorSmartphone, Palette, Bell, Globe, Accessibility,
  Table2, FileText, Users, Briefcase, UserCog, History, Settings2, Sparkles, Wrench,
} from 'lucide-react';

const ALL_ROLES = ['ADMIN_RH', 'SUPERADMIN', 'PE', 'PAT'];

export const SETTINGS_CATEGORIES = [
  {
    key: 'compte',
    label: 'Compte',
    items: [
      { key: 'profil', label: 'Profil et compte', icon: UserRound, roles: ALL_ROLES },
      { key: 'securite', label: 'Sécurité', icon: ShieldCheck, roles: ALL_ROLES },
      { key: 'sessions', label: 'Sessions', icon: MonitorSmartphone, roles: ALL_ROLES },
    ],
  },
  {
    key: 'preferences',
    label: 'Préférences',
    items: [
      { key: 'apparence', label: 'Apparence', icon: Palette, roles: ALL_ROLES },
      { key: 'notifications', label: 'Notifications', icon: Bell, roles: ALL_ROLES },
      { key: 'langue', label: 'Langue & région', icon: Globe, roles: ALL_ROLES },
      { key: 'accessibilite', label: 'Accessibilité', icon: Accessibility, roles: ALL_ROLES },
    ],
  },
  {
    key: 'donnees',
    label: 'Données',
    items: [
      { key: 'tableaux', label: 'Préférences des tableaux', icon: Table2, roles: ['ADMIN_RH', 'SUPERADMIN'] },
      { key: 'documents', label: 'Documents', icon: FileText, roles: ALL_ROLES },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    items: [
      { key: 'personnel', label: 'Personnel', icon: Users, description: 'Types, catégories, corps, grades et statuts du personnel.', roles: ['ADMIN_RH', 'SUPERADMIN'], permission: 'view_personnel', path: '/admin/personnel' },
      { key: 'carriere', label: 'Carrière', icon: Briefcase, description: 'Corps, grades, échelons, positions et mouvements de carrière.', roles: ['ADMIN_RH', 'SUPERADMIN'], permission: 'manage_fonctions', path: '/admin/carriere' },
      { key: 'utilisateurs', label: 'Utilisateurs', icon: UserCog, description: 'Liste des comptes, statuts et rôles.', roles: ['SUPERADMIN'], permission: 'manage_accounts', path: '/superadmin/comptes' },
      { key: 'roles', label: 'Rôles & permissions', icon: ShieldCheck, description: 'Personnel, Administration RH, Super Administration.', roles: ['SUPERADMIN'], permission: 'manage_permissions', path: '/superadmin/permissions' },
      { key: 'journal', label: "Journal d'activité", icon: History, description: 'Historique des actions effectuées dans le SGRH.', roles: ['ADMIN_RH', 'SUPERADMIN'], permission: 'view_historique', path: '/admin/historique' },
    ],
  },
  {
    key: 'systeme',
    label: 'Système',
    items: [
      { key: 'configuration', label: 'Configuration système', icon: Settings2, description: 'Nom, logo, couleurs, textes du site.', roles: ['SUPERADMIN'], permission: 'manage_site_texts', path: '/superadmin/apparence' },
      { key: 'fonctionnalites', label: 'Fonctionnalités', icon: Sparkles, roles: ['SUPERADMIN'] },
      { key: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['SUPERADMIN'] },
    ],
  },
];