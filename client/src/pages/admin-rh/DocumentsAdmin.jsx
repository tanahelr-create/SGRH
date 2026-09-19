import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPersonnel } from '../../services/personnelApi';
import { generateDocument, getHistoriquePersonnel } from '../../services/documentApi';
import PageHeader from '../../components/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';

const TYPES_DOCUMENT = [
  { value: 'certificat_administratif', label: 'Certificat administratif' },
  { value: 'lettre_confirmation', label: 'Lettre de confirmation' },
];

export default function DocumentsAdmin() {
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [typeDocument, setTypeDocument] = useState(TYPES_DOCUMENT[0].value);
  const [historique, setHistorique] = useState([]);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    listPersonnel().then(setPersonnelList).catch(() => {}).finally(() => setListLoading(false));
  }, []);

  async function loadHistorique(id) {
    if (!id) { setHistorique([]); return; }
    try {
      setHistorique(await getHistoriquePersonnel(id));
    } catch {
      setHistorique([]);
    }
  }

  useEffect(() => { loadHistorique(selectedId); }, [selectedId]);

  async function handleGenerate(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const document = await generateDocument(selectedId, typeDocument);
      setStatus('success');
      setMessage('Document généré.');
      loadHistorique(selectedId);
      window.open(`/documents/${document.id}`, '_blank');
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader crumbs={[{ label: 'Admin RH' }, { label: 'Documents' }, { label: 'Documents administratifs' }]} title="Documents administratifs" subtitle="Générer des certificats et lettres pour le personnel" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${!selectedId ? 'lg:col-span-2' : ''}`}>
        <h3 className="font-semibold text-navy dark:text-gold mb-4">Générer un document</h3>
        <form onSubmit={handleGenerate} className="grid grid-cols-2 gap-3 max-w-lg">
          {listLoading ? (
            <Skeleton className="col-span-2 h-9 rounded-md" />
          ) : (
          <select
            required value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="col-span-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="">-- Choisir un employé --</option>
            {personnelList.map((p) => (
              <option key={p.id} value={p.id}>{p.matricule} — {p.prenom} {p.nom}</option>
            ))}
          </select>
          )}

          <select
            value={typeDocument}
            onChange={(e) => setTypeDocument(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {TYPES_DOCUMENT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Génération...' : 'Générer'}
          </button>
        </form>
        {message && (
          <p className={`text-sm mt-2 ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
            {message}
          </p>
        )}
      </div>

      {selectedId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-navy dark:text-gold mb-3">Historique des documents</h3>
          {historique.length === 0 && <p className="text-sm text-gray-400">Aucun document généré pour cet employé.</p>}
          <div className="space-y-2">
            {historique.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b last:border-0 dark:border-gray-700 pb-2">
                <div>
                  <p className="text-sm text-navy dark:text-gray-100">
                    {TYPES_DOCUMENT.find((t) => t.value === d.type_document)?.label || d.type_document}
                  </p>
                  <p className="text-xs text-gray-400">
                    {d.donnees?.numero} — {new Date(d.genere_le).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Link to={`/documents/${d.id}`} target="_blank" className="text-xs text-navy underline">
                  Voir
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}