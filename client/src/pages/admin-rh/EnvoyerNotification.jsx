import { useEffect, useState } from 'react';
import { sendNotification } from '../../services/notificationApi';
import { listUsers } from '../../services/userApi';

const FONCTIONS = [
  'Enseignant', 'Enseignant Chercheur', 'Maître de Conférences', 'Professeur',
  'Agent', 'Chef de service', 'Responsable/Directeur',
];

export default function EnvoyerNotification() {
  const [ciblage, setCiblage] = useState('role'); // 'role' | 'fonction' | 'individual'
  const [role, setRole] = useState('PE');
  const [fonction, setFonction] = useState(FONCTIONS[0]);
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (ciblage === 'individual') {
      listUsers().then(setIndividuals).catch(() => {});
    }
  }, [ciblage]);

  function buildTarget() {
    if (ciblage === 'role') return { type: 'role', role };
    if (ciblage === 'fonction') return { type: 'fonction', fonction };
    return { type: 'individual', recipientIds: [Number(selectedIndividual)] };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const result = await sendNotification(buildTarget(), title, message, type);
      setStatus('success');
      setFeedback(`Notification envoyée à ${result.count} personne(s)`);
      setTitle('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setFeedback(err.message);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinataires</label>
          <select
            value={ciblage}
            onChange={(e) => setCiblage(e.target.value)}
            className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="role">Tout un groupe (PE ou PAT)</option>
            <option value="fonction">Une fonction précise (ex: chefs de service)</option>
            <option value="individual">Une personne précise</option>
          </select>
        </div>

        {ciblage === 'role' && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="PE">Tous les PE</option>
            <option value="PAT">Tous les PAT</option>
          </select>
        )}

        {ciblage === 'fonction' && (
          <select
            value={fonction}
            onChange={(e) => setFonction(e.target.value)}
            className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {FONCTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}

        {ciblage === 'individual' && (
          <select
            required
            value={selectedIndividual}
            onChange={(e) => setSelectedIndividual(e.target.value)}
            className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="">-- Choisir une personne --</option>
            {individuals.map((u) => (
              <option key={u.id} value={u.id}>{u.email} ({u.role}{u.fonction ? ` - ${u.fonction}` : ''})</option>
            ))}
          </select>
        )}

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="info">Information</option>
          <option value="reunion">Réunion</option>
          <option value="echeance">Échéance de contrat</option>
        </select>

        <input
          type="text"
          required
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        />

        <textarea
          required
          rows={3}
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {status === 'loading' ? 'Envoi...' : 'Envoyer'}
        </button>

        {feedback && (
          <p className={`text-sm ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
            {feedback}
          </p>
        )}
      </form>
    </div>
  );
}
