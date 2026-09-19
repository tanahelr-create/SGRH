// Bloc label + champ + erreur/indice, utilisé par Input/Select/Textarea. Peut aussi
// être utilisé seul pour envelopper un champ non standard (ex. GrilleIndiciaireSelector).
export default function FormField({ label, required, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}{required && ' *'}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-status-rejected mt-1">{error}</p>}
    </div>
  );
}
