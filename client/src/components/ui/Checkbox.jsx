export default function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer ${className}`}>
      <input type="checkbox" className="w-4 h-4 accent-navy" {...props} />
      {label}
    </label>
  );
}
