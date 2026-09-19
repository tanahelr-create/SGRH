import PageHeader from '../../components/PageHeader';

export default function VosDroits() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader crumbs={[{ label: 'Aide' }, { label: 'Vos droits' }]} title="Vos droits" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
          <p>Tout membre du personnel de l'Université de Mahajanga peut, selon sa situation :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bénéficier d'un congé annuel, de permissions et d'autorisations d'absence selon la réglementation en vigueur</li>
            <li>Consulter à tout moment ses informations administratives</li>
            <li>Être informé de toute décision concernant ses demandes</li>
            <li>Faire valoir ses droits en cas de désaccord avec une décision, en s'adressant au service RH</li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            Le détail complet des droits par statut (CDI, CDD, Vacataire, Stagiaire) sera précisé prochainement par l'administration.
          </p>
        </div>
      </div>
    </div>
  );
}
