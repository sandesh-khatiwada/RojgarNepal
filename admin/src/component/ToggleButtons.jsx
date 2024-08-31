// ToggleButtons.jsx
import React from 'react';
import './../css/componentCss/ToggleButtons.css'; // Import your CSS file

const ToggleButtons = ({ selected, onSelect }) => {
  return (
    <div className="toggle-buttons">
      <button
        className={`toggle-btn ${selected === 'Client' ? 'active' : ''}`}
        onClick={() => onSelect('Client')}
      >
        Client
      </button>
      <button
        className={`toggle-btn ${selected === 'Freelancer' ? 'active' : ''}`}
        onClick={() => onSelect('Freelancer')}
      >
        Freelancer
      </button>
    </div>
  );
};

export default ToggleButtons;
