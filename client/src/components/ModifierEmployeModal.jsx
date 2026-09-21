import { useState, useEffect } from 'react';
import { updatePersonnel } from '../services/personnelApi';
import { toInputDate } from '../utils/dossier';
import { fetchDirections, fetchServices } from '../services/organisationApi';
import { fetchCategories } from '../services/categorieApi';
import GrilleIndiciaireSelector from './GrilleIndiciaireSelector';
import Modal from './ui/Modal';

const CORPS_OPTIONS = ['EFA', 'ELD', 'Fonctionnaire'];
const TYPES_CONTRAT = ['CDI', 'CDD', 'Vacataire', 'Stagiaire'];

export default function ModifierEmployeModal({ personnel, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nom: personnel.nom || '', prenom: personnel.prenom || '', email: personnel.email || '',
    corps: personnel.corps || '', grade: personnel.grade || '', poste: personnel.poste || '',
    categorieId: personnel.categorie_id || '',
    service: personnel.service || '', direction: personnel.direction || '',
    telephone: personnel.telephone || '', typeContrat: personnel.type_contrat || '',
    dateRecrutement: toInputDate(personnel.date_recrutement),
    dateEcheanceContrat: toInputDate(personnel.date_echeance_contrat),
    contratPermanent: !!personnel.contrat_permanent,
    classe: personnel.classe || '', echelon: personnel.echelon || '', indice: personnel.indice || '',
    categorie: '', cadre: '', echelle: '',
  });
  const [grilleResolved, setGrilleResolved] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDirections().then((list) => {
      setDirections(list);
      const current = list.find((d) => d.nom === personnel.direction);
      if (current) setSelectedDirectionId(String(current.id));
    }).catch(() => setDirections([]));
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!selectedDirectionId) { setServices([]); return; }
    fetchServices(selectedDirectionId).then(setServices).catch(() => setServices([]));
  }, [selectedDirectionId]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDirectionChange(e) {
    const id = e.target.value;
    setSelectedDirectionId(id);
    const dir = directions.find((d) => String(d.id) === id);
    update('direction', dir ? dir.nom : '');
    update('service', '');
  }

  function handleServiceChange(e) {
    const id = e.target.value;
    const svc = services.find((s) => String(s.id) === id);
    update('service', svc ? svc.nom : '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const payload = { ...form, categorieId: form.categorieId || null };
      if (form.corps === 'Fonctionnaire' && grilleResolved && payload.classe && payload.echelon) {
        payload.resolveFromGrille = {
          regime: 'FONCTIONNAIRE', classe: payload.classe, echelon: Number(payload.echelon),
          categorie: payload.categorie || undefined, cadre: payload.cadre || undefined, echelle: payload.echelle || undefined,
        };
      }
      delete payload.categorie; delete payload.cadre; delete payload.echelle;
      await updatePersonnel(personnel.id, payload);
      setStatus('success');
      setMessage('Fiche mise à jour.');
      setTimeout(() => onSuccess?.(), 800);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  return (
    <Modal onClose={onClose} title={`Modifier ${personnel.prenom} ${personnel.nom}`} maxWidth="max-w-2xl">
        <p className="text-xs text-gray-400 mb-4">
          Matricule {personnel.matricule} — la fonction se modifie depuis la page "Fonctions".
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <input
              type="text" value={form.nom}
              onChange={(e) => update('nom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
            <input
              type="text" value={form.prenom}
              onChange={(e) => update('prenom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email" value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poste</label>
            <input
              type="text" value={form.poste}
              onChange={(e) => update('poste', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie professionnelle</label>
            <select
              value={form.categorieId}
              onChange={(e) => update('categorieId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">--</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.appellation}</option>)}
            </select>
          </div>
          {form.corps === 'Fonctionnaire' ? (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Situation réglementaire (grille indiciaire)</label>
              <GrilleIndiciaireSelector
                regime="FONCTIONNAIRE"
                value={{ classe: form.classe, echelon: form.echelon, categorie: form.categorie, cadre: form.cadre, echelle: form.echelle, indice: form.indice }}
                onChange={(next, resolution) => {
                  setForm((prev) => ({ ...prev, ...next }));
                  setGrilleResolved(!!resolution);
                }}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classe</label>
                <input
                  type="text" value={form.classe}
                  onChange={(e) => update('classe', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Échelon</label>
                <input
                  type="text" value={form.echelon}
                  onChange={(e) => update('echelon', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indice</label>
                <input
                  type="text" value={form.indice}
                  onChange={(e) => update('indice', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
            <select
              value={selectedDirectionId}
              onChange={handleDirectionChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">--</option>
              {directions.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
            <select
              value={services.find((s) => s.nom === form.service)?.id || ''}
              onChange={handleServiceChange}
              disabled={!selectedDirectionId}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy disabled:bg-gray-100"
            >
              <option value="">--</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de recrutement</label>
            <input
              type="date" value={form.dateRecrutement}
              onChange={(e) => update('dateRecrutement', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.contratPermanent}
                onChange={(e) => update('contratPermanent', e.target.checked)}
                className="w-4 h-4 accent-navy"
              />
              Contrat permanent
            </label>
          </div>
          {!form.contratPermanent && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin de contrat</label>
              <input
                type="date" value={form.dateEcheanceContrat}
                onChange={(e) => update('dateEcheanceContrat', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
          )}

          <div className="col-span-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {status === 'loading' ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            {message && (
              <p className={`text-sm mt-2 ${status === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
                {message}
              </p>
            )}
          </div>
        </form>
    </Modal>
  );
}