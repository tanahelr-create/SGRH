import { useEffect, useState } from 'react';
import { listCorbeille, restoreFromCorbeille, deletePermanently } from '../../services/corbeilleApi';
import PageHeader from '../../components/PageHeader';

const TYPE_LABELS = { compte: 'Compte utilisateur' };

export default function Corbeille() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await listCorbeille());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRestore(id) {
    setError('');
    try {
      await restoreFromCorbeille(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deletePermanently(id);
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        crumbs={[{ label: 'Administration' }, { label: 'Corbeille' }]}
        title="Corbeille"
        subtitle="Les éléments supprimés restent ici jusqu'à restauration ou suppression définitive"
      />

      {error && <p className="text-sm text-status-rejected mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}
      {!loading && items.length === 0 && <p className="text-gray-500">La corbeille est vide.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-2">
                  {TYPE_LABELS[item.type_element] || item.type_element}
                </span>
                <span className="text-sm text-navy dark:text-gray-100 font-medium">
                  {item.donnees?.email || `#${item.donnees?.id}`}
                </span>
                <span className="text-xs text-gray-400 ml-2">— {item.donnees?.role}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(item.id)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-status-approved text-status-approved hover:bg-green-50"
                >
                  Restaurer
                </button>
                {confirmDeleteId === item.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-status-rejected text-white"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-status-rejected"
                  >
                    Suppr. définitive
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Supprimé par {item.supprime_par_email || 'système'} le {new Date(item.supprime_le).toLocaleString('fr-FR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
