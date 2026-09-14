import { useEffect, useState } from 'react';
import { listPersonnel } from '../../services/personnelApi';
import { getCarriere, addEvenement } from '../../services/carriereApi';

const TYPES_EVENEMENT = [
  'Recrutement', 'Avancement de grade', 'Renouvellement de contrat',
  'Titularisation', 'Retraite', 'Autre',
];

export default function Carriere() {
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [typeEvenement, setTypeEvenement] = useState(TYPES_EVENEMENT[0]);
  const [dateEvenement, setDateEvenement] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    listPersonnel().then(setPersonnelList).catch(() => {});
  }, []);

  async function loadCarriere(id) {
    if (!id) { setData(null); return; }
    setLoading(true);
    try {
      setData(await getCarriere(id));
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCarriere(selectedId); }, [selectedId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');
    try {
      await addEvenement(selectedId, { typeEvenement, description, dateEvenement });
      setStatus('success');
      setFeedback('Événement ajouté.');
      setDateEvenement('');
      setDescription('');
      loadCarriere(selectedId);
    } catch (err) {
      setStatus('error');
      setFeedback(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Choisir un employé</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">-- Sélectionner --</option>
          {personnelList.map((p) => (
            <option key={p.id} value={p.id}>{p.matricule} — {p.prenom} {p.nom}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}

      {data && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold text-navy dark:text-gold mb-3">Ajouter un événement</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
              <select
                value={typeEvenement}
                onChange={(e) => setTypeEvenement(e.target.value)}
                className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {TYPES_EVENEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="date" required value={dateEvenement}
                onChange={(e) => setDateEvenement(e.target.value)}
                className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Ajouter
              </button>
              <input
                type="text" placeholder="Description (optionnel)" value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </form>
            {feedback && (
              <p className={`text-sm mt-2 ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
                {feedback}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold text-navy dark:text-gold mb-4">
              Timeline — {data.personnel.prenom} {data.personnel.nom}
            </h3>
            {data.timeline.length === 0 && <p className="text-sm text-gray-400">Aucun événement enregistré.</p>}
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
              {data.timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-navy dark:bg-gold" />
                  <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm font-medium text-navy dark:text-gray-100">{item.type}</p>
                  {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
