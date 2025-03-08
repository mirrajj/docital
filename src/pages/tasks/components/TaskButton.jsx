import React from 'react';
import { MdClose, MdCheck, MdAdd, MdEdit } from 'react-icons/md';

const TaskButton = ({
  onClick,
  handleCancel,
  showModal,
  name,
  handleSubmit,
  loading,
  disabled = false,
  variant = 'primaryLight',
  className = '',
  icon
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    
    // Prevent multiple clicks while loading
    if (loading || disabled) return;

    // Execute passed functions in order
    if (handleCancel) {
      console.log("hide Modal");
      handleCancel();
    }
    if (onClick) {
      console.log("onClick");
      onClick(e.target.id);
    }
    if (showModal) {
      console.log("show Modal")
      showModal();
    } 
    if (handleSubmit) {
      console.log("handleSubmit");
      handleSubmit(e);
    }
  }

  // Button variant styles
  const variantStyles = {
    primary: 'bg-primaryLight hover:bg-primaryDark text-white',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    cancel: 'bg-white text-red-500 border border-red-300 hover:bg-red-50',
    outline: 'bg-transparent border border-primary text-primaryLight hover:bg-primaryLight/10'
  };

  // Select icon based on name or prop
  const ButtonIcon = icon || (
    name === 'Cancel' ? MdClose :
    name === 'Submit' ? MdCheck :
    name === 'Create New' ? MdAdd :
    name === 'Edit' ? MdEdit :
    null
  );

  return (
    <button
      className={`
        flex items-center justify-center gap-2
        font-semibold 
        rounded-lg 
        px-4 py-2 
        min-w-[100px]
        transition-all 
        duration-200 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2
        ${variantStyles[variant] || variantStyles.primary}
        ${loading ? 'cursor-not-allowed opacity-70' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
      onClick={(e) => handleClick(e)}
      disabled={loading || disabled}
      id={name}
    >
      {loading ? (
        <div className="flex items-center">
          <svg 
            className="animate-spin h-5 w-5 mr-2" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      ) : (
        <>
          {ButtonIcon && <ButtonIcon className="w-5 h-5" />}
          {name || 'Button'}
        </>
      )}
    </button>
  );
}

export default TaskButton;