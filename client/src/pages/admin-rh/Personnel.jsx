import { Fragment, useEffect, useMemo, useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Search, UserPlus, Download, Upload } from 'lucide-react';
import { listPersonnel, exportPersonnelExcel, importPersonnelExcel } from '../../services/personnelApi';
import { getFonctionHistory } from '../../services/userApi';
import AjouterEmployeModal from '../../components/AjouterEmployeModal';
import ModifierEmployeModal from '../../components/ModifierEmployeModal';
import PageHeader from '../../components/PageHeader';
import { toast } from '../../utils/toast';
import { SkeletonTable } from '../../components/ui';

const COLUMNS = [
  { key: 'nom', label: 'Nom' },
  { key: 'fonction', label: 'Fonction' },
  { key: 'role', label: 'Rôle' },
  { key: 'corps', label: 'Corps' },
  { key: 'service', label: 'Service' },
  { key: 'direction', label: 'Direction' },
  { key: 'type_contrat', label: 'Contrat' },
  { key: 'statut', label: 'Statut' },
];

export default function Personnel() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterFonction, setFilterFonction] = useState('');
  const [filterCorps, setFilterCorps] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterContrat, setFilterContrat] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [sortKey, setSortKey] = useState('nom');
  const [sortAsc, setSortAsc] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setPersonnel(await listPersonnel());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(person) {
    if (expandedId === person.id) { setExpandedId(null); return; }
    setExpandedId(person.id);
    setHistory(await getFonctionHistory(person.id).catch(() => []));
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportPersonnelExcel();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importPersonnelExcel(file);
      setImportResult(result);
      load();
    } catch (err) {
      setImportResult({ inserted: 0, errors: [{ line: '-', reason: err.message }] });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  const uniqueValues = (key) => [...new Set(personnel.map((p) => p[key]).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    let list = personnel.filter((p) => {
      const fullName = `${p.prenom || ''} ${p.nom || ''} ${p.matricule || ''}`.toLowerCase();
      if (search && !fullName.includes(search.toLowerCase())) return false;
      if (filterRole && p.role !== filterRole) return false;
      if (filterFonction && p.fonction !== filterFonction) return false;
      if (filterCorps && p.corps !== filterCorps) return false;
      if (filterService && p.service !== filterService) return false;
      if (filterDirection && p.direction !== filterDirection) return false;
      if (filterContrat && p.type_contrat !== filterContrat) return false;
      if (filterStatut === 'en_conge' && !p.en_conge) return false;
      if (filterStatut === 'present' && p.en_conge) return false;
      return true;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'nom') { valA = a.nom || ''; valB = b.nom || ''; }
      else if (sortKey === 'statut') { valA = a.en_conge ? 1 : 0; valB = b.en_conge ? 1 : 0; }
      else { valA = a[sortKey] || ''; valB = b[sortKey] || ''; }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [personnel, search, filterRole, filterFonction, filterCorps, filterService, filterDirection, filterContrat, filterStatut, sortKey, sortAsc]);

  function handleSort(key) {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else { setSortKey(key); setSortAsc(true); }
  }

  function FilterSelect({ value, onChange, options, placeholder }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[9.5rem] border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-navy"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Admin RH' }, { label: 'Personnel' }]} title="Personnel" subtitle="Recherchez, filtrez et gérez les fiches du personnel" />
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-navy dark:text-gray-100 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Export en cours...' : 'Exporter en Excel'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-navy dark:text-gray-100 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Upload size={16} />
          {importing ? 'Import en cours...' : 'Importer un fichier Excel'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleImportFile}
          className="hidden"
        />

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          <UserPlus size={16} />
          Ajouter un employé
        </button>
      </div>

      {importResult && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm font-medium text-status-approved">
            {importResult.inserted} fiche(s) importée(s) avec succès.
          </p>
          {importResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-status-rejected font-medium">{importResult.errors.length} ligne(s) ignorée(s) :</p>
              <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                {importResult.errors.map((e, i) => (
                  <li key={i}>Ligne {e.line} : {e.reason}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setImportResult(null)} className="text-xs text-navy underline mt-2">
            Fermer
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect value={filterRole} onChange={setFilterRole} options={['PE', 'PAT']} placeholder="Rôle" />
          <FilterSelect value={filterFonction} onChange={setFilterFonction} options={uniqueValues('fonction')} placeholder="Fonction" />
          <FilterSelect value={filterCorps} onChange={setFilterCorps} options={uniqueValues('corps')} placeholder="Corps" />
          <FilterSelect value={filterService} onChange={setFilterService} options={uniqueValues('service')} placeholder="Service" />
          <FilterSelect value={filterDirection} onChange={setFilterDirection} options={uniqueValues('direction')} placeholder="Direction" />
          <FilterSelect value={filterContrat} onChange={setFilterContrat} options={uniqueValues('type_contrat')} placeholder="Type de contrat" />
          <FilterSelect value={filterStatut} onChange={setFilterStatut} options={['present', 'en_conge']} placeholder="Statut" />
          {(search || filterRole || filterFonction || filterCorps || filterService || filterDirection || filterContrat || filterStatut) && (
            <button
              onClick={() => { setSearch(''); setFilterRole(''); setFilterFonction(''); setFilterCorps(''); setFilterService(''); setFilterDirection(''); setFilterContrat(''); setFilterStatut(''); }}
              className="text-xs text-navy underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">{filtered.length} résultat(s) sur {personnel.length}</p>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <SkeletonTable rows={8} columns={COLUMNS.length} />
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left px-4 py-2 font-medium text-gray-500 cursor-pointer select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <Fragment key={p.id}>
                  <tr
                    onClick={() => toggleExpand(p)}
                    className="border-b last:border-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <td className="px-4 py-2 text-navy dark:text-gray-100 font-medium whitespace-nowrap">
                      {p.prenom ? `${p.prenom} ${p.nom}` : p.email}
                    </td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">{p.fonction || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{p.role}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{p.corps || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">{p.service || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">{p.direction || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{p.type_contrat || '—'}</td>
                    <td className="px-4 py-2">
                      {p.en_conge ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-status-pending font-medium">En congé</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-status-approved font-medium">Présent</span>
                      )}
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan={COLUMNS.length} className="px-4 py-4">
                        <div className="flex items-start justify-between">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <div>
                              <p className="text-xs text-gray-400">Matricule</p>
                              <p className="text-sm text-navy dark:text-gray-100">{p.matricule || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Email</p>
                              <p className="text-sm text-navy dark:text-gray-100">{p.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Grade</p>
                              <p className="text-sm text-navy dark:text-gray-100">{p.grade || '—'}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingPerson(p); }}
                            className="text-xs text-navy underline shrink-0 ml-4"
                          >
                            Modifier la fiche
                          </button>
                        </div>

                        {history.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-1">Historique des fonctions</p>
                            {history.map((h) => (
                              <p key={h.id} className="text-xs text-gray-500">
                                {new Date(h.changed_at).toLocaleDateString('fr-FR')} : {h.ancienne_fonction || 'Aucune'} → {h.nouvelle_fonction}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-400">
                    Aucun résultat pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AjouterEmployeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); load(); }}
        />
      )}

      {editingPerson && (
        <ModifierEmployeModal
          personnel={editingPerson}
          onClose={() => setEditingPerson(null)}
          onSuccess={() => { setEditingPerson(null); load(); }}
        />
      )}
    </div>
  );
}