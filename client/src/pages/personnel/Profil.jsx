import { useAuth } from '../../context/AuthContext';

const roleLabels = { PE: 'Personnel Enseignant', PAT: 'Personnel Administratif et Technique' };

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-navy">{value || '—'}</p>
    </div>
  );
}

export default function Profil() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-xl font-bold">
          {(user?.prenom?.[0] || user?.email?.[0] || '?').toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-navy">
            {user?.prenom ? `${user.prenom} ${user.nom}` : user?.email}
          </p>
          <p className="text-sm text-gray-500">{roleLabels[user?.role]}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoRow label="Matricule" value={user?.matricule} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Fonction" value={user?.fonction} />
        <InfoRow label="Nom" value={user?.nom} />
        <InfoRow label="Prénom" value={user?.prenom} />
        <InfoRow label="Type de contrat" value={user?.type_contrat} />
      </div>

      <p className="text-xs text-gray-400 mt-6">
        D'autres informations (corps, grade, service, direction...) seront ajoutées une fois le dossier RH complet importé.
      </p>
    </div>
  );
}
