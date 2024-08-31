import React, { useState, useEffect } from 'react';
import SideBar from '../component/SideBar';
import TopSearchBar from '../component/TopSearchBar';
import './../css/pageCss/AdminUserStatistics.css';
import UserStatistics from '../component/UserStatistics.jsx';
import Header from '../component/Header';
import ToggleButtons from '../component/ToggleButtons.jsx'; // Import the ToggleButtons component

const AdminUserStatistics = () => {
  const [userStatistics, setUserStatistics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Client');

  useEffect(() => {
    // Simulating an API call with dummy data
    const fetchData = () => {
      const data = [
        { id: '#001', name: 'Adam Smith', email: 'adamsmith@mail.com', phone: '+91 98765 43210', status: 'Verified', type: 'Client' },
        { id: '#002', name: 'Edward James', email: 'edwardjames@mail.com', phone: '+91 98765 43210', status: 'Unverified', type: 'Client' },
        { id: '#003', name: 'Clara David', email: 'claradavid@mail.com', phone: '+91 98765 43210', status: 'Verified', type: 'Freelancer' },
        { id: '#004', name: 'Jack Adam', email: 'jackadam@mail.com', phone: '+91 98765 43210', status: 'Unverified', type: 'Freelancer' },
        { id: '#005', name: 'Emily Clark', email: 'emilyclark@mail.com', phone: '+91 98765 43210', status: 'Verified', type: 'Client' },
        { id: '#006', name: 'Michael Brown', email: 'michaelbrown@mail.com', phone: '+91 98765 43210', status: 'Verified', type: 'Freelancer' },
        { id: '#007', name: 'Sophia Wilson', email: 'sophiawilson@mail.com', phone: '+91 98765 43210', status: 'Verified', type: 'Client' },
        { id: '#008', name: 'Liam Johnson', email: 'liamjohnson@mail.com', phone: '+91 98765 43210', status: 'Verified', type: 'Freelancer' },
      ];
      setUserStatistics(data);
    };

    fetchData();
  }, []);

  // Filter data based on selected category
  const filteredStatistics = userStatistics.filter(user => user.type === selectedCategory);

  // Determine the page name based on selected category
  const pageName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + ' Statistics';

  return (
    <div className="admin-user-statistics-wrapper">
      <SideBar />
      <main className="admin-content">
        <TopSearchBar />
        <div className="admin-top-controls">
          <ToggleButtons selected={selectedCategory} onSelect={setSelectedCategory} />
          <Header bookings={filteredStatistics} pagename={pageName} />
        </div>
        <UserStatistics userStatistics={filteredStatistics} />
      </main>
    </div>
  );
}

export default AdminUserStatistics;
