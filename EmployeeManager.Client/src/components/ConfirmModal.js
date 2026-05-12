function ConfirmModal({ open, message, onConfirm, oncancel }) {
    debugger
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal">
                <p>Are you sure you want to delete {message}?</p>
                <button onClick={onConfirm}>Yes, Delete</button>
                <button onClick={oncancel}>Cancel</button>
            </div>
        </div>
    );
}

export default ConfirmModal;