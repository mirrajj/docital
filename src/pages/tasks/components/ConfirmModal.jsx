import React from 'react';

const ConfirmModal = ({
    loading,
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Yes, Submit",
    cancelText = "Cancel",
    confirmColor = "bg-primaryLight hover:bg-primaryDark",
    cancelColor = "text-gray-500 bg-transparent hover:bg-gray-100",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-40">
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={onClose} 
            />
            <div className="bg-white dark:bg-slate-900 rounded-lg z-50 shadow-lg max-w-md w-full mx-4 overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-orange-500"
                            >
                                <path d="M10.24 3.957l-8.422 14.06A1.989 1.989 0 0 0 3.518 21h16.845a1.989 1.989 0 0 0 1.7-2.983l-8.423-14.06a1.989 1.989 0 0 0-3.4 0z"></path>
                                <path d="M12 9v4"></path>
                                <path d="M12 17h.01"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{message}</p>
                    </div>
                </div>
                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 dark:border-gray-800">
                    <button
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-colors"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`flex-1 px-4 py-2 text-sm font-medium bg-primaryLight text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight dark:focus:ring-offset-gray-900 transition-colors`}
                        onClick={onConfirm}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;