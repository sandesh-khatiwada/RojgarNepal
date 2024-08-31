import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './../css/componentCss/SideBar.css';
import logo from './../images/LOGO.png';

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    // Clear token from local storage
    localStorage.removeItem('token'); // Updated key for the token

    // Navigate to the admin page
    navigate('/admin');
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Determine the active path
  const getActiveClass = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="sidebar-navbar">
      <div className="sidebar-logo-header">
        <button 
          className="sidebar-logo-button"
          onClick={() => navigate('/admin-user')}
        >
          <img src={logo} alt="RojgarNepal Logo" className="sidebar-logo" />
        </button>
        <button className="sidebar-menu-toggle" onClick={toggleNav}>
          ☰
        </button>
      </div>
      <div className={`sidebar-navigation ${isNavOpen ? 'open' : ''}`}>
        <ul>
          <li className={`sidebar-nav-item ${getActiveClass('/admin-user')}`} onClick={() => navigate('/admin-user')}>
            USER STATISTICS
          </li>
          <li className={`sidebar-nav-item ${getActiveClass('/admin-booking')}`} onClick={() => navigate('/admin-booking')}>
            BOOKINGS
          </li>
          <li className={`sidebar-nav-item ${getActiveClass('/admin-jobPosts')}`} onClick={() => navigate('/admin-jobPosts')}>
            JOB POSTS
          </li>
          <li className={`sidebar-nav-item ${getActiveClass('/admin-verifyUser')}`} onClick={() => navigate('/admin-verifyUser')}>
            VERIFY USER
          </li>
        </ul>
      </div>
      <button className="sidebar-logout-button" onClick={handleLogout}>Log Out</button>
    </nav>
  );
};

export default SideBar;
