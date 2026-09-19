export default function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-1">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy dark:bg-gold/10 dark:text-gold">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h3 className="text-lg font-semibold text-navy dark:text-gold">{title}</h3>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="mt-4 divide-y divide-slate-100 dark:divide-gray-700">{children}</div>
    </section>
  );
}