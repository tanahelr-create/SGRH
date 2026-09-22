import { useText } from '../../context/TextContext';

export default function Footer() {
  const nomApplication = useText('footer.nom_application', 'Université de Mahajanga', 'Footer');
  const description = useText('footer.description', '', 'Footer');
  const copyright = useText('footer.copyright', 'Tous droits réservés', 'Footer');

  return (
    <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 space-y-0.5">
      {description && <p>{description}</p>}
      <p>© {new Date().getFullYear()} {nomApplication} — {copyright}</p>
    </footer>
  );
}
