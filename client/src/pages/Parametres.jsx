import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authApi';

const roleLabels = { ADMIN_RH: 'Admin RH', SUPERADMIN: 'Superadmin', PE: 'Personnel PE', PAT: 'Personnel PAT' };

export default function Parametres() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setFeedback('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setStatus('loading');
    try {
      await changePassword(currentPassword, newPassword);
      setStatus('success');
      setFeedback('Mot de passe mis à jour.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setFeedback(err.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-navy dark:text-gold mb-3">Mon compte</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabels[user?.role]}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-navy dark:text-gold mb-4">Changer le mot de passe</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" required placeholder="Mot de passe actuel"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          />
          <input
            type="password" required minLength={8} placeholder="Nouveau mot de passe"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          />
          <input
            type="password" required minLength={8} placeholder="Confirmer le nouveau mot de passe"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
          />
          <button
            type="submit" disabled={status === 'loading'}
            className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
          {feedback && (
            <p className={`text-sm ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
              {feedback}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
