import React, { useEffect, useState } from "react";
import "./FormModal.css";

const FormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialValues = {},
    fields = [],
    mode = "add",
    entityName = "Item"
}) => {

    const [formData, setFormData] = useState(initialValues);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialValues);
        }
    }, [initialValues, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    ✕
                </button>
                <h2>
                    {mode === "add" ? `Add ${entityName}` : `Edit ${entityName}`}
                </h2>

                <form onSubmit={handleSubmit}>
                    {fields.map((field) => (
                        field.type === "textarea" ? (
                            <textarea
                                key={field.name}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                required={field.required}
                            />
                        ) : (
                            <input
                                key={field.name}
                                type={field.type}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                required={field.required}
                            />
                        )
                    ))}

                    <div className="modal-buttons">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>

                        <button type="submit" className="submit-btn">
                            {mode === "add" ? "Create" : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormModal;