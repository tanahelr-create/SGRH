import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDemandeDetails } from '../services/congeApi';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';

const STATUS_LABELS = { en_attente: 'En attente', approuvee: 'Approuvée', refusee: 'Refusée' };

function fmt(date) {
  if (!date) return '____/____/____';
  return new Date(date).toLocaleDateString('fr-FR');
}

export default function FicheDemande() {
  const { id } = useParams();
  const [demande, setDemande] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDemandeDetails(id).then(setDemande).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="p-8 text-status-rejected">{error}</div>;

  if (!demande) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white p-10 shadow" role="status" aria-label="Chargement de la demande">
          <Skeleton className="h-3 w-2/3 rounded mx-auto mb-2" />
          <Skeleton className="h-3 w-1/2 rounded mx-auto mb-6" />
          <Skeleton className="h-5 w-1/3 rounded mx-auto mb-8" />
          <SkeletonText lines={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto bg-white p-10 shadow print:shadow-none">
        <div className="flex justify-end mb-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-navy text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            Imprimer / Télécharger en PDF
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-xs">REPOBLIKAN'I MADAGASIKARA</p>
          <p className="text-xs italic">Fitiavana - Tanindrazana - Fandrosoana</p>
          <p className="text-sm font-semibold mt-2">MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE</p>
          <p className="text-sm font-semibold">UNIVERSITÉ DE MAHAJANGA</p>
          <p className="text-xs mt-1">Service Administration Réseau et Informatisation</p>
        </div>

        <h1 className="text-center font-bold underline mb-6">
          DEMANDE DE : {demande.type_conge.toUpperCase()}
        </h1>

        <div className="space-y-2 text-sm">
          <p><span className="font-semibold underline">MATRICULE</span> : {demande.matricule}</p>
          <p><span className="font-semibold underline">NOM ET PRÉNOM(S)</span> : {demande.nom} {demande.prenom}</p>
          <p><span className="font-semibold underline">FONCTION</span> : {demande.fonction || '—'}</p>
          <p><span className="font-semibold underline">CORPS ET GRADE</span> : {[demande.corps, demande.grade].filter(Boolean).join(' ; ') || '—'}</p>
          <p><span className="font-semibold underline">MOTIF</span> : {demande.motif || '—'}</p>
          <p><span className="font-semibold underline">LIEU DE JOUISSANCE</span> : {demande.lieu_jouissance || '—'}</p>
          <p><span className="font-semibold underline">A COMPTER DU</span> : {fmt(demande.date_debut)} au {fmt(demande.date_fin)}</p>
          <p><span className="font-semibold underline">DATE DE REPRISE DE SERVICE</span> : {fmt(demande.date_reprise_service)}</p>
          <p><span className="font-semibold underline">REMPLAÇANT(E)</span> : {demande.remplacant || '—'}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-10 text-sm">
          <div>
            <p className="font-semibold underline mb-8">AVIS DU CHEF DE SERVICE</p>
            <p>{demande.avis_chef_service || '.....................................'}</p>
          </div>
          <div className="text-right">
            <p>Mahajanga, le {fmt(demande.created_at)}</p>
            <p className="mt-8">L'intéressé</p>
            <p className="mt-6">{demande.prenom} {demande.nom}</p>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t text-sm">
          <p className="font-semibold">
            Statut : <span className={
              demande.status === 'approuvee' ? 'text-status-approved' :
              demande.status === 'refusee' ? 'text-status-rejected' : 'text-status-pending'
            }>{STATUS_LABELS[demande.status]}</span>
          </p>
        </div>
      </div>
    </div>
  );
}