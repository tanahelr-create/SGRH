import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { registerToastHandlers } from '../utils/toast';
import ToastContainer from '../components/ui/ToastContainer';

const ToastContext = createContext(null);

const DEFAULT_DURATION = { success: 4000, info: 4000, warning: 6000, error: 7000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, options = {}) => {
    const id = ++idRef.current;
    const duration = options.duration ?? DEFAULT_DURATION[type] ?? 5000;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  useEffect(() => {
    registerToastHandlers({ push });
    return () => registerToastHandlers(null);
  }, [push]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// Alternative "React-idiomatique" à l'API impérative `toast.success(...)` — les deux
// pointent vers le même état, à utiliser selon la préférence du composant appelant.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return {
    success: (message, options) => ctx.push('success', message, options),
    error: (message, options) => ctx.push('error', message, options),
    warning: (message, options) => ctx.push('warning', message, options),
    info: (message, options) => ctx.push('info', message, options),
    dismiss: ctx.dismiss,
  };
}
