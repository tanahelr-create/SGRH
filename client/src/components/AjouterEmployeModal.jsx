import { useState } from 'react';
import { X } from 'lucide-react';
import { createPersonnel } from '../services/personnelApi';

const FONCTIONS_PAR_ROLE = {
  PE: ['Enseignant', 'Enseignant Chercheur', 'Maître de Conférences', 'Professeur'],
  PAT: ['Agent', 'Chef de service', 'Responsable/Directeur'],
};
const CORPS_OPTIONS = ['EFA', 'ELD', 'Fonctionnaire'];
const TYPES_CONTRAT = ['CDI', 'CDD', 'Vacataire', 'Stagiaire'];

const empty = {
  matricule: '', nom: '', prenom: '', email: '', role: 'PE', fonction: '',
  corps: '', grade: '', service: '', direction: '', telephone: '', typeContrat: '',
};

export default function AjouterEmployeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(form.matricule)) {
      setStatus('error');
      setMessage('Le matricule doit contenir exactement 6 chiffres.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await createPersonnel(form);
      setStatus('success');
      setMessage('Fiche personnel créée.');
      setTimeout(() => onSuccess?.(), 800);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 sm:p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-navy dark:text-gold">Ajouter un employé</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">Les champs marqués * sont obligatoires.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matricule (6 chiffres) *</label>
            <input
              type="text" required maxLength={6} value={form.matricule}
              onChange={(e) => update('matricule', e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
            <input
              type="text" required value={form.nom}
              onChange={(e) => update('nom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
            <input
              type="text" required value={form.prenom}
              onChange={(e) => update('prenom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle *</label>
            <select
              required value={form.role}
              onChange={(e) => { update('role', e.target.value); update('fonction', ''); }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="PE">PE</option>
              <option value="PAT">PAT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fonction</label>
            <select
              value={form.fonction}
              onChange={(e) => update('fonction', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">--</option>
              {FONCTIONS_PAR_ROLE[form.role].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corps</label>
            <select
              value={form.corps}
              onChange={(e) => update('corps', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">--</option>
              {CORPS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade</label>
            <input
              type="text" value={form.grade}
              onChange={(e) => update('grade', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
            <input
              type="text" value={form.service}
              onChange={(e) => update('service', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
            <input
              type="text" value={form.direction}
              onChange={(e) => update('direction', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
            <input
              type="text" value={form.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de contrat</label>
            <select
              value={form.typeContrat}
              onChange={(e) => update('typeContrat', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">--</option>
              {TYPES_CONTRAT.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {status === 'loading' ? 'Enregistrement...' : "Enregistrer l'employé"}
            </button>
            {message && (
              <p className={`text-sm mt-2 ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
