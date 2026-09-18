export default function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-start gap-3 mb-1">
        {Icon && <Icon size={18} className="mt-0.5 text-navy dark:text-gold shrink-0" />}
        <div>
          <h3 className="font-semibold text-navy dark:text-gold">{title}</h3>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="mt-4 divide-y divide-slate-100 dark:divide-gray-700">{children}</div>
    </section>
  );
}