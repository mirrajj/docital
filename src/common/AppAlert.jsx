import React, { useEffect, useState } from 'react';
import { MdCheck, MdError, MdInfo, MdWarning } from 'react-icons/md'; // Import icons

const AppAlert = ({ type, message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimatingOut(true); // Start slide-out animation
      setTimeout(() => {
        setIsVisible(false); // Hide the alert after animation
        onClose(); // Call the onClose callback
      }, 300); // Match the duration of the slide-out animation
    }, duration);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [duration, onClose]);

  if (!isVisible) return null;

  // Define styles and icons based on the alert type
  const alertStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const alertIcons = {
    success: <MdCheck className="text-white text-sm" />,
    error: <MdError className="text-white text-sm" />,
    info: <MdInfo className="text-white text-sm" />,
    warning: <MdWarning className="text-white text-sm" />,
  };

  return (
    <div className="fixed top-4 right-4 overflow-hidden z-30">
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isAnimatingOut ? 'animate-slide-out' : 'animate-slide-in'
        } ${alertStyles[type]} text-white p-2 rounded shadow flex items-center space-x-2`}
      >
        <span>{alertIcons[type]}</span>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

export default AppAlert;