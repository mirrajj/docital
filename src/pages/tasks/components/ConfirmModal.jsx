import React from 'react';
import LoadingSpinner from '../../../common/LoadingSpinner';

const ConfirmModal = ({
    loading,
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Yes, Submit",
    cancelText = "Cancel",
    confirmColor = "btn-primary",
    cancelColor = "border-red-400 bg-transparent text-red-400 border px-3 rounded-lg",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4 text-gray-500">{title}</h3>
                <p className="font-bold text-orange-400">{message}</p>
                <div className="mt-4 flex justify-center gap-4">
                    <button className={confirmColor} onClick={onConfirm}>
                        {loading ? <LoadingSpinner size={20}/> : confirmText}
                    </button>
                    <button className={cancelColor} onClick={onClose}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;