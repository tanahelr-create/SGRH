import { LoaderCircle } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-navy text-white hover:opacity-90 dark:bg-gold dark:text-navy',
  secondary: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-navy dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
  danger: 'bg-status-rejected text-white hover:opacity-90',
  ghost: 'bg-transparent text-navy dark:text-gold hover:underline',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

// Bouton standard du SGRH. `loading` désactive le bouton et affiche un spinner,
// ce qui empêche nativement les doubles soumissions sur les actions réseau.
export default function Button({
  variant = 'primary', size = 'md', loading = false, disabled = false,
  type = 'button', className = '', children, ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${SIZES[size] || SIZES.md} ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
