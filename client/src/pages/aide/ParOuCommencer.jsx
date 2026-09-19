import PageHeader from '../../components/PageHeader';

export default function ParOuCommencer() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        crumbs={[{ label: 'Aide' }, { label: 'Par où commencer' }]}
        title="Par où commencer ?"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>Consultez votre <strong>profil</strong> pour vérifier que vos informations (matricule, fonction, contrat) sont correctes.</li>
          <li>Utilisez la page <strong>Congés</strong> pour soumettre une demande — vos informations personnelles se remplissent automatiquement.</li>
          <li>Surveillez la cloche de <strong>notifications</strong> : vous y recevrez les décisions sur vos demandes et les annonces de l'administration.</li>
          <li>En cas de question, contactez le service RH de l'université.</li>
        </ol>
      </div>
    </div>
  );
}
