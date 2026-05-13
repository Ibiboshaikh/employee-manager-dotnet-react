// ============================================================================
// ConfirmModal — generic delete-confirmation dialog.
//
// State-driven: parent controls visibility via the `open` prop. Returns null
// when closed (React renders nothing). When open, an overlay (styles in
// App.css) shows a Yes/Cancel pair that calls back into the parent.
// ============================================================================

function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>Are you sure you want to delete {message}?</p>
        <button onClick={onConfirm}>Yes, Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ConfirmModal;
