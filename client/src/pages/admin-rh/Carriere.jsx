import { useEffect, useState } from 'react';
import { usePermissions } from '../../context/PermissionContext';
import { listPersonnel } from '../../services/personnelApi';
import {
  getCarriere, addEvenement, updateEvenement, deleteEvenement, addDiplome, deleteDiplome,
} from '../../services/carriereApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TYPES_EVENEMENT = [
  'Recrutement', 'Stage', 'Titularisation', 'Prolongation de stage', "Avancement d'échelon",
  'Avancement de grade', 'Reclassement', 'Changement de fonction', "Changement d'affectation",
  "Changement de service ou d'établissement", 'Mise à disposition', 'Détachement', 'Disponibilité',
  'Formation ou diplôme', 'Changement de qualification', 'Avenant au contrat', 'Renouvellement de contrat',
  'Suspension ou événement disciplinaire', 'Retraite', 'Fin de contrat', 'Cessation définitive de fonctions',
  'Réintégration', 'Autre',
];

const emptyForm = {
  typeEvenement: TYPES_EVENEMENT[0], dateEvenement: '', dateEffet: '', description: '',
  corps: '', grade: '', classe: '', echelon: '', indice: '', fonction: '', affectation: '',
  motif: '', referenceDecision: '', autoriteDecision: '', observations: '',
};

function fileUrl(path) {
  return path ? `${API_URL.replace(/\/api\/?$/, '')}${path}` : null;
}

export default function Carriere() {
  const { can } = usePermissions();
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [diplomeForm, setDiplomeForm] = useState({ intitule: '', etablissement: '', anneeObtention: '' });
  const [diplomeFile, setDiplomeFile] = useState(null);
  const [diplomeStatus, setDiplomeStatus] = useState(null);

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

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  }

  function startEdit(item) {
    if (item.source !== 'evenement') return;
    setEditingId(item.id);
    setForm({
      typeEvenement: item.type, dateEvenement: item.date?.slice(0, 10) || '',
      dateEffet: item.dateEffet?.slice(0, 10) || '', description: item.description || '',
      corps: item.corps || '', grade: item.grade || '', classe: item.classe || '', echelon: item.echelon || '',
      indice: item.indice || '', fonction: item.fonction || '', affectation: item.affectation || '',
      motif: item.motif || '', referenceDecision: item.referenceDecision || '', autoriteDecision: item.autoriteDecision || '',
      observations: item.observations || '',
    });
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');
    try {
      if (editingId) {
        await updateEvenement(editingId, form, file);
        setFeedback('Événement modifié.');
      } else {
        await addEvenement(selectedId, form, file);
        setFeedback('Événement ajouté.');
      }
      setStatus('success');
      resetForm();
      loadCarriere(selectedId);
    } catch (err) {
      setStatus('error');
      setFeedback(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteEvenement(id);
      setConfirmDeleteId(null);
      loadCarriere(selectedId);
    } catch (err) {
      setFeedback(err.message);
    }
  }

  async function handleAddDiplome(e) {
    e.preventDefault();
    setDiplomeStatus('loading');
    try {
      await addDiplome(selectedId, diplomeForm, diplomeFile);
      setDiplomeStatus('success');
      setDiplomeForm({ intitule: '', etablissement: '', anneeObtention: '' });
      setDiplomeFile(null);
      loadCarriere(selectedId);
    } catch (err) {
      setDiplomeStatus('error');
      setFeedback(err.message);
    }
  }

  async function handleDeleteDiplome(id) {
    try {
      await deleteDiplome(id);
      loadCarriere(selectedId);
    } catch (err) {
      setFeedback(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Choisir un employé</label>
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); resetForm(); }}
          className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">-- Sélectionner --</option>
          {personnelList.map((p) => (
            <option key={p.id} value={p.id}>{p.matricule} — {p.prenom} {p.nom} ({p.role})</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}

      {data && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold text-navy dark:text-gold mb-3">
              {editingId ? "Modifier l'événement" : 'Ajouter un événement'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={form.typeEvenement}
                onChange={(e) => updateForm('typeEvenement', e.target.value)}
                className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy sm:col-span-3"
              >
                {TYPES_EVENEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date de l'événement *</label>
                <input
                  type="date" required value={form.dateEvenement}
                  onChange={(e) => updateForm('dateEvenement', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date d'effet</label>
                <input
                  type="date" value={form.dateEffet}
                  onChange={(e) => updateForm('dateEffet', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Référence de la décision</label>
                <input
                  type="text" value={form.referenceDecision}
                  onChange={(e) => updateForm('referenceDecision', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Corps</label>
                <input
                  type="text" value={form.corps}
                  onChange={(e) => updateForm('corps', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Grade</label>
                <input
                  type="text" value={form.grade}
                  onChange={(e) => updateForm('grade', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Classe</label>
                <input
                  type="text" value={form.classe}
                  onChange={(e) => updateForm('classe', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Échelon</label>
                <input
                  type="text" value={form.echelon}
                  onChange={(e) => updateForm('echelon', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Indice</label>
                <input
                  type="text" value={form.indice}
                  onChange={(e) => updateForm('indice', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fonction</label>
                <input
                  type="text" value={form.fonction}
                  onChange={(e) => updateForm('fonction', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Affectation</label>
                <input
                  type="text" value={form.affectation}
                  onChange={(e) => updateForm('affectation', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Autorité ayant pris la décision</label>
                <input
                  type="text" value={form.autoriteDecision}
                  onChange={(e) => updateForm('autoriteDecision', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Motif</label>
                <textarea
                  rows={2} value={form.motif}
                  onChange={(e) => updateForm('motif', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description / observations</label>
                <textarea
                  rows={2} value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Document justificatif (PDF, JPG, PNG)</label>
                <input
                  type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-3 flex gap-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {editingId ? 'Enregistrer les modifications' : 'Ajouter'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300"
                  >
                    Annuler la modification
                  </button>
                )}
              </div>
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
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({data.personnel.role === 'PE' ? 'Enseignant-chercheur' : 'PATS'} — {data.personnel.corps || 'statut non renseigné'})
              </span>
            </h3>
            {data.timeline.length === 0 && <p className="text-sm text-gray-400">Aucun événement enregistré.</p>}
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
              {data.timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-navy dark:bg-gold" />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString('fr-FR')}
                        {item.dateEffet && ` — effet au ${new Date(item.dateEffet).toLocaleDateString('fr-FR')}`}
                      </p>
                      <p className="text-sm font-medium text-navy dark:text-gray-100">{item.type}</p>
                      {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                      {(item.corps || item.grade || item.classe || item.echelon || item.indice) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[item.corps, item.grade, item.classe && `classe ${item.classe}`, item.echelon && `échelon ${item.echelon}`, item.indice && `indice ${item.indice}`].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {item.referenceDecision && <p className="text-xs text-gray-400">Réf. décision : {item.referenceDecision}</p>}
                      {item.autoriteDecision && <p className="text-xs text-gray-400">Autorité : {item.autoriteDecision}</p>}
                      {item.justificatifPath && (
                        <a href={fileUrl(item.justificatifPath)} target="_blank" rel="noreferrer" className="text-xs text-navy underline">
                          Voir le justificatif
                        </a>
                      )}
                    </div>
                    {item.source === 'evenement' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(item)} className="text-xs text-navy underline">Modifier</button>
                        {can('delete_carriere_evenement') && (
                          confirmDeleteId === item.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(item.id)} className="text-xs text-status-rejected font-medium">Confirmer</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-400">Annuler</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(item.id)} className="text-xs text-gray-400 hover:text-status-rejected">Supprimer</button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.personnel.role === 'PE' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-navy dark:text-gold mb-3">Diplômes et qualifications</h3>
              <form onSubmit={handleAddDiplome} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <input
                  type="text" required placeholder="Intitulé" value={diplomeForm.intitule}
                  onChange={(e) => setDiplomeForm((p) => ({ ...p, intitule: e.target.value }))}
                  className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  type="text" placeholder="Établissement" value={diplomeForm.etablissement}
                  onChange={(e) => setDiplomeForm((p) => ({ ...p, etablissement: e.target.value }))}
                  className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="number" placeholder="Année" value={diplomeForm.anneeObtention}
                  onChange={(e) => setDiplomeForm((p) => ({ ...p, anneeObtention: e.target.value }))}
                  className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDiplomeFile(e.target.files[0] || null)}
                  className="sm:col-span-3 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={diplomeStatus === 'loading'}
                  className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Ajouter
                </button>
              </form>
              {data.diplomes.length === 0 && <p className="text-sm text-gray-400">Aucun diplôme enregistré.</p>}
              <div className="space-y-2">
                {data.diplomes.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <div>
                      <p className="text-sm font-medium text-navy dark:text-gray-100">{d.intitule}</p>
                      <p className="text-xs text-gray-400">
                        {[d.etablissement, d.annee_obtention].filter(Boolean).join(' — ')}
                      </p>
                      {d.document_path && (
                        <a href={fileUrl(d.document_path)} target="_blank" rel="noreferrer" className="text-xs text-navy underline">
                          Voir le document
                        </a>
                      )}
                    </div>
                    <button onClick={() => handleDeleteDiplome(d.id)} className="text-xs text-gray-400 hover:text-status-rejected">Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}