import React, { useEffect } from 'react';
import './../css/componentCss/ErrorModal.css'; // Import the CSS file

const ErrorModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Close the modal after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <button onClick={onClose} className="ok-btn">OK</button>
      </div>
    </div>
  );
};

export default ErrorModal;
