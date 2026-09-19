import { useEffect, useState } from 'react';
import { fetchParametresCarriere, updateParametreCarriere } from '../../services/parametreCarriereApi';
import PageHeader from '../../components/PageHeader';

export default function ParametresCarriere() {
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [status, setStatus] = useState({});

  async function load() {
    setLoading(true);
    try {
      setParams(await fetchParametresCarriere());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(cle) {
    setStatus((s) => ({ ...s, [cle]: 'loading' }));
    try {
      await updateParametreCarriere(cle, edits[cle]);
      setStatus((s) => ({ ...s, [cle]: 'success' }));
      load();
    } catch (err) {
      setStatus((s) => ({ ...s, [cle]: 'error' }));
      alert(err.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        crumbs={[{ label: 'Admin RH' }, { label: 'Carrière' }, { label: 'Paramètres carrière' }]}
        title="Paramètres carrière"
        subtitle="Ces valeurs pilotent les règles de progression de carrière"
      />
      <p className="text-sm text-gray-500 mb-4">
        Les paramètres marqués <span className="text-status-pending font-medium">à valider</span> sont
        issus d'informations recueillies mais non encore confirmées officiellement par la RH — modifie-les dès que la règle définitive est connue.
      </p>

      {loading && <p className="text-gray-500">Chargement...</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {params.map((p) => (
          <div key={p.cle} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-navy dark:text-gray-100">
                  {p.cle}
                  {p.a_valider && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-50 text-status-pending font-medium">À valider</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                defaultValue={p.valeur}
                onChange={(e) => setEdits((prev) => ({ ...prev, [p.cle]: e.target.value }))}
                className="flex-1 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => handleSave(p.cle)}
                disabled={status[p.cle] === 'loading'}
                className="bg-navy text-white rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
            {status[p.cle] === 'success' && <p className="text-xs text-status-approved mt-1">Enregistré.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}