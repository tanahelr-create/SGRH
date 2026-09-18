export default function SettingsSelect({ label, description, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}