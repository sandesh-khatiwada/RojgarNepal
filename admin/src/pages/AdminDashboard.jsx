import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import SideBar from '../component/SideBar.jsx';
import TopSearchBar from './../component/TopSearchBar.jsx';
import './../css/pageCss/AdminDashboard.css';
import BookingTable from './../component/BookingTable.jsx';
import Header from './../component/Header.jsx';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null); // Add state for error handling
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to /admin if token is not present
      navigate('/admin');
      return; // Exit the useEffect early to prevent fetching bookings
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/bookings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setBookings(response.data.bookings);
          setError(null); // Clear error if successful
        } else {
          setError(response.data.message || 'Failed to fetch bookings');
          setBookings([]); // Clear bookings if there's an error
        }
      } catch (error) {
        setError('An error occurred while fetching bookings.');
        setBookings([]); // Clear bookings if there's an error
      }
    };

    fetchBookings();
  }, [navigate]); // Add navigate to dependency array

  return (
    <div className="admin-dashboard">
      <SideBar />
      <main className="content">
        <TopSearchBar />
        <Header bookings={bookings} pagename="Bookings" />
        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}
        <BookingTable bookings={bookings} />
      </main>
    </div>
  );
};

export default AdminDashboard;
