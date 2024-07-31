import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSignOutAlt, faComments, faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './../css/componentCss/Navbarclient.css';
import profile from './../images/profile.png';

const Navbarclient = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for required items
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (!fullName || !userId || !userType || !token) {
      // Redirect to /login if any item is missing
      navigate('/login');
    }
  }, [navigate]);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() === '') {
      localStorage.removeItem('searchedTalent');
    } else {
      localStorage.setItem('searchedTalent', searchQuery);
    }

    navigate('/talentsearch');
    window.location.reload();
  };

  const handleChatClick = () => {
    navigate('/chat'); // Redirect to /chat
  };

  const handleProfileClick = () => {
    navigate('/clientDashboard'); // Redirect to /clientDashboard
  };

  const handleLogoutClick = () => {
    // Remove items from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('fullName');
    localStorage.removeItem('token');
    
    // Redirect to /login
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/client'); // Redirect to /client when "RojgarNepal" is clicked
  };

  return (
    <nav className={`navbar ${menuOpen ? 'show' : ''}`}>
      <div className="logo" onClick={handleLogoClick}>
        RojgarNepal
      </div>
      <div className="menu-toggle" id="mobile-menu" onClick={handleMenuToggle}>
        <FontAwesomeIcon icon={faBars} />
      </div>
  
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search Talents..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
        />
        <FontAwesomeIcon icon={faSearch} className="search-icon" onClick={handleSearchSubmit} />
      </div>
      <div className="navbar-icons">
        <div className="icon-wrapper" onClick={handleChatClick}>
          <FontAwesomeIcon icon={faComments} className="icon" />
          {/* <div className="notification-bubble">3</div> */}
        </div>
        <div className="profile-icon" onClick={handleProfileClick}>
          <img src={profile} alt="Profile" />
        </div>
        <div className="icon-wrapper" onClick={handleLogoutClick}>
          <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
        </div>
      </div>
    </nav>
  );
};

export default Navbarclient;
