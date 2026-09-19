import Modal from './Modal';
import Button from './Button';

// Boîte de confirmation générique pour les actions destructives/irréversibles.
// Rien dans l'app n'utilisait ce pattern avant (les confirmations existantes sont
// des boutons "Confirmer" inline) — disponible pour un usage futur, pas imposé
// aux flux existants qui fonctionnent déjà.
export default function ConfirmDialog({
  open, title = 'Confirmer', message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler',
  danger = false, loading = false, onConfirm, onCancel,
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
