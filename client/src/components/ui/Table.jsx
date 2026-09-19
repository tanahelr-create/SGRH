// Coquille de table légère : uniformise le style (overflow-x-auto, en-têtes,
// séparateurs) sans imposer de logique de tri/filtre — chaque page garde la sienne.
export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>;
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ as: Comp = 'td', children, className = '', ...props }) {
  return (
    <Comp className={`px-3 py-2 ${className}`} {...props}>
      {children}
    </Comp>
  );
}
