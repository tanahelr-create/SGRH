import PageHeader from '../../components/PageHeader';

export default function Procedures() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader crumbs={[{ label: 'Aide' }, { label: 'Les procédures' }]} title="Les procédures" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
        <div>
          <p className="font-medium text-navy dark:text-gray-100">Demande de congé / permission</p>
          <p>Remplissez le formulaire dans "Congés", en précisant le type, les dates et le motif. Votre demande part directement au service RH.</p>
        </div>
        <div>
          <p className="font-medium text-navy dark:text-gray-100">Suivi d'une demande</p>
          <p>Le statut (en attente, approuvée, refusée) s'affiche dans "Mes demandes". Une notification vous informe dès qu'une décision est prise.</p>
        </div>
        <div>
          <p className="font-medium text-navy dark:text-gray-100">Fiche imprimable</p>
          <p>Chaque demande dispose d'un lien "Voir / télécharger la fiche", reprenant le format officiel de l'université.</p>
        </div>
      </div>
      </div>
    </div>
  );
}
