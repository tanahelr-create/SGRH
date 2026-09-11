import { useEffect, useState } from 'react';
import { listUsers, changeFonction, getFonctionHistory } from '../../services/userApi';
import { FONCTIONS_PAR_ROLE } from '../../constants/fonctions';

export default function GestionFonctions() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newFonction, setNewFonction] = useState('');
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    listUsers().then(setUsers).catch(() => {});
  }, []);

  const selectedUser = users.find((u) => u.id === Number(selectedUserId));

  useEffect(() => {
    if (selectedUserId) {
      getFonctionHistory(selectedUserId).then(setHistory).catch(() => setHistory([]));
    } else {
      setHistory([]);
    }
  }, [selectedUserId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await changeFonction(selectedUserId, newFonction);
      setStatus('success');
      setFeedback('Fonction mise à jour');
      setUsers(await listUsers());
      setHistory(await getFonctionHistory(selectedUserId));
      setNewFonction('');
    } catch (err) {
      setStatus('error');
      setFeedback(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500 mb-4">
          Modifier la fonction d'un membre du personnel (avancement de grade, changement de poste...).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membre du personnel</label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => { setSelectedUserId(e.target.value); setNewFonction(''); }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">-- Choisir --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email} — {u.fonction || 'aucune fonction'}</option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelle fonction</label>
              <select
                required
                value={newFonction}
                onChange={(e) => setNewFonction(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="">-- Choisir --</option>
                {FONCTIONS_PAR_ROLE[selectedUser.role].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !selectedUserId || !newFonction}
            className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Mise à jour...' : 'Valider le changement'}
          </button>

          {feedback && (
            <p className={`text-sm ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
              {feedback}
            </p>
          )}
        </form>
      </div>

      {selectedUserId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-navy mb-3">Historique des changements</h3>
          {history.length === 0 && <p className="text-sm text-gray-400">Aucun changement enregistré.</p>}
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="text-sm border-b last:border-0 pb-2">
                <p className="text-navy">
                  {h.ancienne_fonction || 'Aucune'} → <span className="font-medium">{h.nouvelle_fonction}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(h.changed_at).toLocaleString('fr-FR')} par {h.changed_by_email || 'système'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
