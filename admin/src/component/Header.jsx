import React from 'react';
import Circlecheck from '../pages/Circlecheck';
import './../css/componentCss/Header.css';

const Header = ({ bookings, pagename }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Total {pagename}:</h1><><br/></>
        <Circlecheck data={bookings.length} />
      </div>
    </header>
  );
};

export default Header;
