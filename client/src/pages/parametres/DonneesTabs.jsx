import { Table2, FileText } from 'lucide-react';
import { useSettingsPreferences } from '../../context/SettingsPreferencesContext';
import SettingsCard from '../../components/settings/SettingsCard';
import SettingsSelect from '../../components/settings/SettingsSelect';
import SettingsToggle from '../../components/settings/SettingsToggle';

export function PreferencesTableaux() {
  const { prefs, updateNested } = useSettingsPreferences();
  const t = prefs.table;
  return (
    <SettingsCard icon={Table2} title="Préférences des tableaux" description="S'applique aux listes de personnel, congés, documents, etc.">
      <SettingsSelect label="Lignes par page" value={String(t.pageSize)}
        onChange={(v) => updateNested('table', 'pageSize', Number(v))}
        options={[10, 25, 50, 100].map((n) => ({ value: String(n), label: String(n) }))} />
      <SettingsToggle label="Mémoriser les filtres" checked={t.rememberFilters} onChange={(v) => updateNested('table', 'rememberFilters', v)} />
      <SettingsToggle label="Mémoriser le tri" checked={t.rememberSort} onChange={(v) => updateNested('table', 'rememberSort', v)} />
      <SettingsToggle label="Afficher les colonnes supplémentaires" checked={t.showExtraColumns} onChange={(v) => updateNested('table', 'showExtraColumns', v)} />
    </SettingsCard>
  );
}

const TYPES_DOCUMENTS = ['CIN', 'Diplôme', 'Contrat', 'Attestation', 'Décision', 'Arrêté', 'Certificat'];

export function Documents() {
  const { prefs, updateNested } = useSettingsPreferences();
  const d = prefs.documents;
  return (
    <SettingsCard icon={FileText} title="Documents" description="Préférences d'affichage pour vos documents RH.">
      <SettingsToggle label="Prévisualisation automatique" checked={d.autoPreview} onChange={(v) => updateNested('documents', 'autoPreview', v)} />
      <SettingsToggle label="Téléchargement automatique" checked={d.autoDownload} onChange={(v) => updateNested('documents', 'autoDownload', v)} />
      <SettingsSelect label="Format préféré" value={d.preferredFormat} onChange={(v) => updateNested('documents', 'preferredFormat', v)}
        options={[{ value: 'pdf', label: 'PDF' }, { value: 'image', label: 'Image' }]} />
      <div className="py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">Types de documents</p>
        <div className="flex flex-wrap gap-2">
          {TYPES_DOCUMENTS.map((t) => (
            <span key={t} className="rounded-full bg-slate-100 dark:bg-gray-700 px-3 py-1 text-xs text-slate-600 dark:text-gray-300">{t}</span>
          ))}
        </div>
      </div>
    </SettingsCard>
  );
}