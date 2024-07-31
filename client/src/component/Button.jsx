import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../css/componentCss/Button.css';

const Button = ({ label, link }) => {
  const navigate = useNavigate();

  return (
    <button className="button" onClick={() => navigate(link)}>
      {label}
    </button>
  );
};

export default Button;
