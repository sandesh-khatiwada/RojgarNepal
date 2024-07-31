

import React, { useState, useEffect } from 'react';
import axios from 'axios';

//Navigate to Login logic
import { useNavigate } from 'react-router-dom';

//Navigate to Login logic



// import JobPost from '../pages/JobPost';
import JobPost from '../pages/JobPost';


import './../css/componentCss/CHeaderClient.css';


const CHeader = () => {
  const [jobPosts, setJobPosts] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const clientname = localStorage.getItem("fullName");


//Navigate to Login logic
  const navigate = useNavigate(); // Use useNavigate hook for navigation
//Navigate to Login logic

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
    
        const response = await axios.get(`http://localhost:5000/client/stats`, {
          params: {
            userId: userId
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });


    
        if (response.data.success) {



   
          setJobPosts(response.data.data.jobPosts.count);
          setBookings(response.data.data.bookings.count);

          console.log(response.data.data.jobPosts.count);
          console.log(response.data.data.bookings.count);
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
    
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          // Unauthorized or Forbidden
          navigate('/login'); // Redirect to login page
        }
    
        setError('Error fetching stats');
      } finally {
        setLoading(false);
      }
    };
    

    fetchStats();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;

  }

  return (
    <header className="Cheader">
      <div className="greeting-section">
        <div className="greeting">
          <h1>Hello <span className="client-name">{clientname}</span>! 👋</h1>
          <p className="motive">Let's kick start your project by posting a job now.</p>
          <p className="stats">
            Bookings: <span className="bookings">{bookings}</span> <br />
            Job Posts: <span className="job-posts">{jobPosts}</span>
          </p>
          <a href="/clientDashboard" className="new-action">View Status</a>
        </div>


     


        <button className="post-job-button"><a href="/jobpost">+ Post a Job</a></button>

        
        {/* <button className="post-job-button"><a href="./../pages/jobpost">+ Post a Job</a></button> */}


      </div>
    </header>
  );
};

export default CHeader;
