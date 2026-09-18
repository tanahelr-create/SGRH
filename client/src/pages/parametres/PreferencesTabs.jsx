import { Palette, Bell, Mail, Globe, Accessibility } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsPreferences } from '../../context/SettingsPreferencesContext';
import SettingsCard from '../../components/settings/SettingsCard';
import SettingsSelect from '../../components/settings/SettingsSelect';
import SettingsToggle from '../../components/settings/SettingsToggle';

export function Apparence() {
  const { theme, setTheme } = useTheme();
  const { prefs, update } = useSettingsPreferences();

  return (
    <SettingsCard icon={Palette} title="Apparence" description="Personnalisez l'affichage de votre espace SGRH.">
      <SettingsSelect label="Thème" description="Clair, sombre ou basé sur les préférences système."
        value={theme} onChange={setTheme}
        options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }, { value: 'system', label: 'Système' }]} />
      <SettingsSelect label="Densité" description="Espacement du contenu dans les tableaux et listes."
        value={prefs.density} onChange={(v) => update('density', v)}
        options={[{ value: 'compact', label: 'Compacte' }, { value: 'normal', label: 'Normale' }, { value: 'comfortable', label: 'Confortable' }]} />
      <SettingsSelect label="Taille du texte" value={prefs.textSize} onChange={(v) => update('textSize', v)}
        options={[{ value: 'small', label: 'Petit' }, { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Grand' }]} />
      <SettingsSelect label="Sidebar" description="Affichage de la navigation principale."
        value={prefs.sidebarMode} onChange={(v) => update('sidebarMode', v)}
        options={[{ value: 'expanded', label: 'Toujours ouverte' }, { value: 'collapsed', label: 'Réduite' }]} />
      <SettingsToggle label="Animations" description="Active les transitions et animations de l'interface."
        checked={prefs.animations} onChange={(v) => update('animations', v)} />
    </SettingsCard>
  );
}

const APP_ITEMS = [
  ['nouvelles_demandes', 'Nouvelles demandes'], ['modification_profil', 'Modification du profil'],
  ['documents_disponibles', 'Documents disponibles'], ['validation_demande', "Validation d'une demande"],
  ['refus_demande', "Refus d'une demande"], ['messages_administratifs', 'Messages administratifs'],
  ['alertes_importantes', 'Alertes importantes'],
];
const EMAIL_ITEMS = [
  ['notifications_importantes', 'Notifications importantes'], ['nouvelles_demandes', 'Nouvelles demandes'],
  ['documents', 'Documents'], ['rappels', 'Rappels'], ['informations_administratives', 'Informations administratives'],
];

export function Notifications() {
  const { prefs, updateNested } = useSettingsPreferences();
  return (
    <div className="space-y-6">
      <SettingsCard icon={Bell} title="Notifications dans l'application" description="Choisissez les alertes affichées dans le SGRH.">
        {APP_ITEMS.map(([key, label]) => (
          <SettingsToggle key={key} label={label} checked={prefs.notifications.app[key]}
            onChange={(v) => updateNested('notifications', 'app', { ...prefs.notifications.app, [key]: v })} />
        ))}
      </SettingsCard>
      <SettingsCard icon={Mail} title="Notifications par email" description="Choisissez les emails que vous souhaitez recevoir.">
        {EMAIL_ITEMS.map(([key, label]) => (
          <SettingsToggle key={key} label={label} checked={prefs.notifications.email[key]}
            onChange={(v) => updateNested('notifications', 'email', { ...prefs.notifications.email, [key]: v })} />
        ))}
      </SettingsCard>
    </div>
  );
}

export function LangueRegion() {
  const { prefs, update } = useSettingsPreferences();
  return (
    <SettingsCard icon={Globe} title="Langue & région" description="La traduction complète de l'interface sera disponible ultérieurement.">
      <SettingsSelect label="Langue" value={prefs.langue} onChange={(v) => update('langue', v)}
        options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English (bientôt disponible)' }]} />
      <SettingsSelect label="Format de date" value={prefs.dateFormat} onChange={(v) => update('dateFormat', v)}
        options={[{ value: 'dd/mm/yyyy', label: '17/09/2026' }, { value: 'long', label: '17 septembre 2026' }]} />
      <SettingsSelect label="Format horaire" value={prefs.timeFormat} onChange={(v) => update('timeFormat', v)}
        options={[{ value: '24h', label: '24 heures' }, { value: '12h', label: '12 heures' }]} />
    </SettingsCard>
  );
}

export function Accessibilite() {
  const { prefs, update } = useSettingsPreferences();
  return (
    <SettingsCard icon={Accessibility} title="Accessibilité" description="Ajustez l'interface selon vos besoins.">
      <SettingsToggle label="Contraste élevé" description="Renforce les contrastes de couleurs et le focus visible."
        checked={prefs.highContrast} onChange={(v) => update('highContrast', v)} />
      <SettingsToggle label="Réduction des animations" description="Diminue les transitions et mouvements à l'écran."
        checked={prefs.reduceMotion} onChange={(v) => update('reduceMotion', v)} />
      <SettingsToggle label="Mise en évidence des éléments interactifs" description="Contour visible sur les boutons et liens au focus clavier."
        checked={prefs.keyboardHighlight} onChange={(v) => update('keyboardHighlight', v)} />
    </SettingsCard>
  );
}