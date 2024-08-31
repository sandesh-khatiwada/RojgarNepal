import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../component/SideBar';
import TopSearchBar from '../component/TopSearchBar';
import './../css/pageCss/AdminUserStatistics.css';
import UserStatistics from '../component/UserStatistics.jsx';
import Header from '../component/Header';
import ToggleButtons from '../component/ToggleButtons.jsx'; // Import the ToggleButtons component

const AdminUserStatistics = () => {
  const [userStatistics, setUserStatistics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Client');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token and redirect if not present
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return; // Prevent further execution if token is missing
    }

    // Fetch user statistics
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserStatistics(response.data.users); // Extract the users array from the response
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Filter data based on selected category
  const filteredStatistics = userStatistics.filter(user => user.userType === selectedCategory);

  // Determine the page name based on selected category
  const pageName = `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Statistics`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching user data: {error.message}</div>;
  }

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
