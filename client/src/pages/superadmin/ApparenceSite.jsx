import { useEffect, useState } from 'react';
import { getAllTexts, updateText } from '../../services/siteTextsApi';
import { getSiteSettings, updateSiteSetting } from '../../services/siteSettingsAdminApi';
import { useTextContext } from '../../context/TextContext';

const COLOR_LABELS = {
  color_navy: 'Bleu marine (accent principal)',
  color_gold: 'Or (accent secondaire)',
  color_status_pending: 'Statut — en attente',
  color_status_approved: 'Statut — approuvé',
  color_status_rejected: 'Statut — refusé',
};

export default function ApparenceSite() {
  const [tab, setTab] = useState('couleurs'); // 'couleurs' | 'textes'
  const [colors, setColors] = useState({});
  const [textList, setTextList] = useState([]);
  const [search, setSearch] = useState('');
  const [savingKey, setSavingKey] = useState(null);
  const { reload: reloadTexts } = useTextContext();

  useEffect(() => {
    getSiteSettings().then(setColors);
    getAllTexts().then((data) => setTextList(data.list || []));
  }, []);

  async function handleColorChange(key, value) {
    setColors((prev) => ({ ...prev, [key]: value })); // aperçu immédiat local
  }

  async function handleColorSave(key) {
    setSavingKey(key);
    try {
      await updateSiteSetting(key, colors[key]);
      document.documentElement.style.setProperty(`--${key.replace('color_', 'color-').replace(/_/g, '-')}`, colors[key]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingKey(null);
    }
  }

  async function handleTextChange(key, value) {
    setTextList((prev) => prev.map((t) => (t.key === key ? { ...t, value } : t)));
  }

  async function handleTextSave(key, value) {
    setSavingKey(key);
    try {
      await updateText(key, value);
      await reloadTexts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingKey(null);
    }
  }

  const groupedTexts = {};
  textList
    .filter((t) => !search || t.key.toLowerCase().includes(search.toLowerCase()) || t.value.toLowerCase().includes(search.toLowerCase()))
    .forEach((t) => {
      if (!groupedTexts[t.category]) groupedTexts[t.category] = [];
      groupedTexts[t.category].push(t);
    });

  return (
    <div className="max-w-3xl">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('couleurs')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'couleurs' ? 'bg-navy text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
        >
          Couleurs
        </button>
        <button
          onClick={() => setTab('textes')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'textes' ? 'bg-navy text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
        >
          Textes ({textList.length})
        </button>
      </div>

      {tab === 'couleurs' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-navy dark:text-gray-100">{COLOR_LABELS[key] || key}</p>
                  <p className="text-xs text-gray-400">{value}</p>
                </div>
              </div>
              <button
                onClick={() => handleColorSave(key)}
                disabled={savingKey === key}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-navy text-white hover:opacity-90 disabled:opacity-50"
              >
                {savingKey === key ? '...' : 'Enregistrer'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'textes' && (
        <div>
          <input
            type="text"
            placeholder="Rechercher un texte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-navy"
          />

          {Object.entries(groupedTexts).map(([category, items]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 font-semibold text-navy dark:text-gold text-sm">
                {category}
              </div>
              <div className="divide-y dark:divide-gray-700">
                {items.map((t) => (
                  <div key={t.key} className="p-4">
                    <p className="text-xs text-gray-400 mb-1 font-mono">{t.key}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={t.value}
                        onChange={(e) => handleTextChange(t.key, e.target.value)}
                        className="flex-1 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                      />
                      <button
                        onClick={() => handleTextSave(t.key, t.value)}
                        disabled={savingKey === t.key}
                        className="px-3 py-2 rounded-md text-xs font-medium bg-navy text-white hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                      >
                        {savingKey === t.key ? '...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {textList.length === 0 && (
            <p className="text-sm text-gray-400">Aucun texte enregistré pour l'instant — visite les pages de l'application pour qu'elles s'enregistrent automatiquement ici.</p>
          )}
        </div>
      )}
    </div>
  );
}
