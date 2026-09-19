// Reprend l'idiome déjà utilisé partout dans l'app (bg-white dark:bg-gray-800
// rounded-lg shadow) — ne change rien visuellement, factorise juste la classe.
export default function Card({ as: Comp = 'div', padding = 'p-6', className = '', children, ...props }) {
  return (
    <Comp className={`bg-white dark:bg-gray-800 rounded-lg shadow ${padding} ${className}`} {...props}>
      {children}
    </Comp>
  );
}
