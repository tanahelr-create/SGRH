import { useEffect, useRef, useState } from 'react';
import {
  Briefcase, Building2, Calendar, CalendarClock, Camera, Check, FileText,
  Globe2, Hash, Heart, Home, LoaderCircle, Mail, MapPin, Pencil, Phone, ShieldCheck,
  UserCog, UserRound, Users, X,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { getMaCarriere } from '../../services/carriereApi';
import { getMyPersonnel, updateMyProfilePhoto, updateMesInfos } from '../../services/personnelApi';
import { Skeleton, SkeletonAvatar, SkeletonText } from '../../components/ui';

const roleLabels = { PE: 'Personnel Enseignant', PAT: 'Personnel Administratif et Technique' };
const SITUATIONS_FAMILIALES = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];
const SEXES = ['Masculin', 'Féminin'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function present(value) {
  return value === null || value === undefined || value === '' ? 'Non renseigné' : value;
}

function formatDate(value) {
  if (!value) return 'Non renseigné';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : 'Non renseigné';
}

function toDateInputValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

function seniority(date) {
  if (!date) return 'Non renseigné';
  const start = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime()) || start > new Date()) return 'Non renseigné';
  const today = new Date();
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} an${years !== 1 ? 's' : ''}${months ? ` et ${months} mois` : ''}`;
}

function photoUrl(photo) {
  if (!photo) return null;
  return `${API_URL.replace(/\/api\/?$/, '')}${photo}`;
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy dark:bg-gold/10 dark:text-gold">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-slate-800 dark:text-gray-100">{present(value)}</p>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy dark:text-gold">
          <Icon size={18} aria-hidden="true" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Profil() {
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const inputRef = useRef(null);
  const previewRef = useRef(null);

  const [editingContact, setEditingContact] = useState(false);
  const [formTelephone, setFormTelephone] = useState('');
  const [formAdresse, setFormAdresse] = useState('');
  const [formSituation, setFormSituation] = useState(SITUATIONS_FAMILIALES[0]);
  const [formSexe, setFormSexe] = useState(SEXES[0]);
  const [formDateNaissance, setFormDateNaissance] = useState('');
  const [formLieuNaissance, setFormLieuNaissance] = useState('');
  const [formNationalite, setFormNationalite] = useState('');
  const [formDatePriseFonction, setFormDatePriseFonction] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([getMyPersonnel(), getMaCarriere()])
      .then(([fiche, career]) => {
        if (!active) return;
        setPersonnel(fiche);
        setTimeline(career.timeline || []);
      })
      .catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choisissez une image JPG, PNG ou WebP.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 3 Mo.");
      event.target.value = '';
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setError('');
    setSelectedPhoto(file);
    setPreview(objectUrl);
  }

  function cancelPhoto() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setSelectedPhoto(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function savePhoto() {
    if (!selectedPhoto) return;
    setSavingPhoto(true);
    setError('');
    try {
      const updated = await updateMyProfilePhoto(selectedPhoto);
      setPersonnel(updated);
      cancelPhoto();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPhoto(false);
    }
  }

  function startEditingContact() {
    setFormTelephone(personnel.telephone || '');
    setFormAdresse(personnel.adresse || '');
    setFormSituation(personnel.situation_familiale || SITUATIONS_FAMILIALES[0]);
    setFormSexe(personnel.sexe || SEXES[0]);
    setFormDateNaissance(toDateInputValue(personnel.date_naissance));
    setFormLieuNaissance(personnel.lieu_naissance || '');
    setFormNationalite(personnel.nationalite || '');
    setFormDatePriseFonction(toDateInputValue(personnel.date_prise_fonction));
    setContactMessage('');
    setContactStatus(null);
    setEditingContact(true);
  }

  async function saveContact(e) {
    e.preventDefault();
    setSavingContact(true);
    setContactMessage('');
    try {
      const updated = await updateMesInfos({
        telephone: formTelephone,
        adresse: formAdresse,
        situationFamiliale: formSituation,
        sexe: formSexe,
        dateNaissance: formDateNaissance,
        lieuNaissance: formLieuNaissance,
        nationalite: formNationalite,
        datePriseFonction: formDatePriseFonction,
      });
      setPersonnel(updated);
      setEditingContact(false);
      setContactStatus('success');
      setContactMessage('Informations mises à jour.');
    } catch (err) {
      setContactStatus('error');
      setContactMessage(err.message);
    } finally {
      setSavingContact(false);
    }
  }

  if (!personnel && !error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-2" role="status" aria-label="Chargement du dossier personnel">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy/80 p-7">
          <div className="flex items-center gap-5">
            <SkeletonAvatar size={96} className="bg-white/20" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-48 rounded bg-white/20" />
              <Skeleton className="h-3 w-32 rounded bg-white/20" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <Skeleton className="h-4 w-1/3 rounded mb-4" />
              <SkeletonText lines={4} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!personnel) return <p className="py-8 text-sm text-status-rejected">{error}</p>;

  const fullName = [personnel.prenom, personnel.nom].filter(Boolean).join(' ') || user?.email;
  const currentPhoto = photoUrl(personnel.photo_profil);
  const contractStatus = personnel.contrat_permanent ? 'Permanent' : personnel.type_contrat;
  const estActif = (user?.status || 'active') === 'active';

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-2">
      <PageHeader
        crumbs={[{ label: 'Mon espace', path: '/dashboard' }, { label: 'Mon dossier' }]}
        title="Mon dossier"
        subtitle="Informations personnelles et administratives"
      />

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy/80 shadow-sm">
        <div className="flex flex-col gap-5 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="relative shrink-0">
              {currentPhoto ? (
                <img src={currentPhoto} alt={`Photo de ${fullName}`} className="h-24 w-24 rounded-full border-4 border-white/20 object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10" aria-label="Aucune photo de profil">
                  <UserRound size={44} aria-hidden="true" />
                </div>
              )}
              <button
                type="button" onClick={() => inputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-navy shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Modifier la photo de profil"
              >
                <Camera size={16} aria-hidden="true" />
              </button>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={selectPhoto} />
            </div>
            <div className="min-w-0">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estActif ? 'bg-emerald-400/20 text-emerald-300' : 'bg-red-400/20 text-red-300'}`}>
                {estActif ? 'Actif' : 'Inactif'}
              </span>
              <h2 className="mt-1.5 break-words text-xl font-bold">{fullName || 'Non renseigné'}</h2>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-white/80 sm:justify-start">
                <span>Matricule : {present(personnel.matricule)}</span>
                <span>Fonction : {present(personnel.fonction)}</span>
                <span>Catégorie : {present(personnel.role)}</span>
              </div>
            </div>
          </div>
          {!editingContact && (
            <button
              type="button" onClick={startEditingContact}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Pencil size={16} aria-hidden="true" /> Modifier mes informations
            </button>
          )}
        </div>
        {selectedPhoto && (
          <div className="border-t border-white/15 bg-white/10 p-5 text-white sm:px-7">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <img src={preview} alt="Aperçu de la nouvelle photo" className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-semibold">Aperçu de la nouvelle photo</p>
                <p className="text-sm text-white/75">{selectedPhoto.name}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={cancelPhoto} disabled={savingPhoto} className="inline-flex items-center gap-1 rounded-lg border border-white/40 px-3 py-2 text-sm font-medium disabled:opacity-50">
                  <X size={16} /> Annuler
                </button>
                <button type="button" onClick={savePhoto} disabled={savingPhoto} className="inline-flex items-center gap-1 rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-navy disabled:opacity-50">
                  {savingPhoto ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-rejected dark:border-red-900 dark:bg-red-950/30">{error}</p>}
      {contactMessage && (
        <p className={`text-sm px-1 ${contactStatus === 'success' ? 'text-status-approved' : 'text-status-rejected'}`}>
          {contactMessage}
        </p>
      )}

      {editingContact ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy dark:text-gold">
            <Pencil size={18} aria-hidden="true" /> Modifier mes informations
          </h2>
          <form onSubmit={saveContact} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Sexe</label>
                <select
                  value={formSexe} onChange={(e) => setFormSexe(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Date de naissance</label>
                <input
                  type="date" value={formDateNaissance} onChange={(e) => setFormDateNaissance(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Lieu de naissance</label>
                <input
                  type="text" value={formLieuNaissance} onChange={(e) => setFormLieuNaissance(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Nationalité</label>
                <input
                  type="text" value={formNationalite} onChange={(e) => setFormNationalite(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Date de prise de fonction</label>
                <input
                  type="date" value={formDatePriseFonction} onChange={(e) => setFormDatePriseFonction(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Situation familiale</label>
                <select
                  value={formSituation} onChange={(e) => setFormSituation(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  {SITUATIONS_FAMILIALES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Téléphone</label>
              <input
                type="text" value={formTelephone} onChange={(e) => setFormTelephone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">Adresse</label>
              <textarea
                rows={2} value={formAdresse} onChange={(e) => setFormAdresse(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button" onClick={() => setEditingContact(false)} disabled={savingContact}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit" disabled={savingContact}
                className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {savingContact ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card icon={Users} title="Informations personnelles">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field icon={UserRound} label="Nom" value={personnel.nom} />
              <Field icon={UserRound} label="Prénom" value={personnel.prenom} />
              <Field icon={Mail} label="E-mail" value={personnel.email} />
              <Field icon={Users} label="Sexe" value={personnel.sexe} />
              <Field icon={Calendar} label="Date de naissance" value={formatDate(personnel.date_naissance)} />
              <Field icon={MapPin} label="Lieu de naissance" value={personnel.lieu_naissance} />
              <Field icon={Globe2} label="Nationalité" value={personnel.nationalite} />
              <Field icon={Heart} label="Situation familiale" value={personnel.situation_familiale} />
              <Field icon={Phone} label="Téléphone" value={personnel.telephone} />
              <Field icon={Home} label="Adresse" value={personnel.adresse} />
            </div>
          </Card>

          <Card icon={Briefcase} title="Informations administratives">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field icon={Hash} label="Matricule" value={personnel.matricule} />
              <Field icon={UserCog} label="Catégorie du personnel" value={roleLabels[personnel.role] || personnel.role} />
              <Field icon={Users} label="Type de personnel" value={personnel.role} />
              <Field icon={ShieldCheck} label="Statut" value={contractStatus} />
              <Field icon={Briefcase} label="Fonction" value={personnel.fonction} />
              <Field icon={Briefcase} label="Poste" value={personnel.poste} />
              <Field icon={Building2} label="Service" value={personnel.service} />
              <Field icon={UserRound} label="Supérieur hiérarchique" value={personnel.responsable_hierarchique} />
              <Field icon={CalendarClock} label="Date de prise de fonction" value={formatDate(personnel.date_prise_fonction)} />
              <Field icon={CalendarClock} label="Ancienneté" value={seniority(personnel.date_recrutement)} />
            </div>
          </Card>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold tracking-wide text-navy dark:border-gray-700 dark:bg-gray-800 dark:text-gold sm:px-6">
          <FileText size={18} aria-hidden="true" /> Parcours professionnel
        </h2>
        <div className="p-5 sm:p-6">
          {timeline.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">Aucune information de carrière n'est actuellement enregistrée.</p>
          ) : (
            <ol className="space-y-4 border-l-2 border-slate-200 pl-5 dark:border-gray-700">
              {timeline.map((item, index) => (
                <li key={`${item.source}-${item.date}-${index}`} className="relative">
                  <span className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-gold ring-4 ring-white dark:ring-gray-800" />
                  <p className="text-xs text-slate-500 dark:text-gray-400">{formatDate(item.date)}</p>
                  <p className="mt-0.5 text-sm font-semibold text-navy dark:text-gray-100">{item.type}</p>
                  {item.description && <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{item.description}</p>}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-gray-700 dark:text-gray-300">
            <FileText size={17} className="text-gold" aria-hidden="true" /> Date de recrutement : <span className="font-medium">{formatDate(personnel.date_recrutement)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
