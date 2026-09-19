import { forwardRef } from 'react';
import FormField from './FormField';

const BASE = 'w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed';

const Textarea = forwardRef(function Textarea({ label, required, error, hint, id, rows = 3, className = '', fieldClassName = '', ...props }, ref) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} htmlFor={id} className={fieldClassName}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`${BASE} ${error ? 'border-status-rejected focus:ring-status-rejected' : ''} ${className}`}
        {...props}
      />
    </FormField>
  );
});

export default Textarea;
