import React from 'react';
import './../css/componentCss/ServiceBox.css'

const ServiceBox = ({ title, image, description }) => {
  return (
    <div className="service-box">
      <img src={image} alt={title} className="service-image" />
      <div className="service-title">{title}</div>
      {/* <div className="service-description">{description}</div> */}
    </div>
  );
};

export default ServiceBox;