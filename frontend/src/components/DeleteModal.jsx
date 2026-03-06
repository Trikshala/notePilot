import React from "react";
import "./FormModal.css";

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, entityName }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    ✕
                </button>
                <h3>Delete Confirmation</h3>
                <p>
                    Are you sure you want to delete <strong>{itemName}</strong> {entityName}?
                </p>
                <div className="modal-buttons">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={onConfirm} className="submit-btn delete-btn">Delete</button>

                </div>
            </div>

        </div>
    )

}

export default DeleteModal;