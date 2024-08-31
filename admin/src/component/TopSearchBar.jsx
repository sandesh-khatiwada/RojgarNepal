import React from 'react';
import './../css/componentCss/TopSearchBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const TopSearchBar = () => {
  return (
    <div className="top-search-bar">
      <div className="greeting"><h1>Hello Admin,</h1></div>
      <div className="search-container">
        {/* <input type="text" placeholder="Search User" className="search-input" /> */}
        {/* <FontAwesomeIcon icon={faSearch} className="search-icon" /> */}
      </div>
      <hr className="separator" />
    </div>
  );
};

export default TopSearchBar;
