// ============================================================================
// ConfirmModal — generic delete-confirmation dialog.
//
// State-driven: parent controls visibility via the `open` prop. Returns null
// when closed (React renders nothing). When open, an overlay (styles in
// App.css) shows a Yes/Cancel pair that calls back into the parent.
// ============================================================================
interface ConfirmModalProps {
  open: boolean;              // Whether the modal is visible
  message: string;           // Custom message to show (e.g. employee name)
  onConfirm: () => void;     // Callback when user confirms the action
  onCancel: () => void;      // Callback when user cancels the action
}
function ConfirmModal({ open, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <p className="text-ink dark:text-gray-100">Are you sure you want to delete {message}?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
