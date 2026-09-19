const VARIANTS = {
  neutral: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  approved: 'bg-status-approved/10 text-status-approved',
  pending: 'bg-status-pending/10 text-status-pending',
  rejected: 'bg-status-rejected/10 text-status-rejected',
  info: 'bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium align-middle whitespace-nowrap ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}>
      {children}
    </span>
  );
}
