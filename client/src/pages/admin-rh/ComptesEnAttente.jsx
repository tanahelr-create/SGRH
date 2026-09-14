import { useEffect, useState } from 'react';
import { getPendingAccounts, approvePendingAccount, rejectPendingAccount } from '../../services/personnelApi';

export default function ComptesEnAttente() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setAccounts(await getPendingAccounts());
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id) {
    setActionError('');
    try {
      await approvePendingAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleReject(id) {
    setActionError('');
    try {
      await rejectPendingAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Comptes créés via matricule + code de vérification, en attente d'activation.
      </p>

      {actionError && <p className="text-sm text-status-rejected mb-4">{actionError}</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}
      {!loading && accounts.length === 0 && <p className="text-gray-500">Aucun compte en attente.</p>}

      <div className="space-y-3">
        {accounts.map((a) => (
        <div key={a.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-navy dark:text-gray-100">{a.prenom} {a.nom}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{a.email} — Matricule {a.matricule}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{a.role}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(a.id)}
                className="px-4 py-2 rounded-md border border-status-rejected text-status-rejected text-sm font-medium hover:bg-red-50"
              >
                Refuser
              </button>
              <button
                onClick={() => handleApprove(a.id)}
                className="px-4 py-2 rounded-md bg-navy text-white text-sm font-medium hover:opacity-90"
              >
                Activer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
