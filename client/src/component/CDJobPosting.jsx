import React, { useEffect, useState } from 'react';
import './../css/componentCss/CDJobPosting.css';

const CDJobPosting = () => {
  const postsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [jobPosts, setJobPosts] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Fetch Job Posts
    const fetchJobPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/client/job-posts?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJobPosts(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch job posts');
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    // Fetch Booking Requests
    const fetchBookingRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/client/booking-requests?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookingRequests(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch booking requests');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchJobPosts();
    fetchBookingRequests();
  }, []);

  const totalJobPages = Math.ceil(jobPosts.length / postsPerPage);
  const totalBookingPages = Math.ceil(bookingRequests.length / postsPerPage);

  const jobStartIndex = (currentPage - 1) * postsPerPage;
  const bookingStartIndex = (currentBookingPage - 1) * postsPerPage;

  const visibleJobPosts = jobPosts.slice(jobStartIndex, jobStartIndex + postsPerPage);
  const visibleBookingRequests = bookingRequests.slice(bookingStartIndex, bookingStartIndex + postsPerPage);

  const handleJobViewMore = () => {
    if (currentPage < totalJobPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleJobViewPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBookingViewMore = () => {
    if (currentBookingPage < totalBookingPages) {
      setCurrentBookingPage(currentBookingPage + 1);
    }
  };

  const handleBookingViewPrevious = () => {
    if (currentBookingPage > 1) {
      setCurrentBookingPage(currentBookingPage - 1);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/client/jobposting?jpid=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setJobPosts(jobPosts.filter(job => job.jpid !== id));
      } else {
        setError(data.message || 'Failed to delete job posting');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="job-postings-section">
      <br /><br />
      <h2>My Booking Requests</h2>
      <div className="post-cards-container">
        {visibleBookingRequests.length === 0 ? (
          <p>You don't have any booking requests yet.</p>
        ) : (
          visibleBookingRequests.map((request) => (
            <div key={request.id} className="job-posting-card">
              <div className="job-posting-header">
                <h3 className="job-posting-title">{request.jobTitle}</h3>
              </div>
              <p className="job-posting-date">{new Date(request.date).toLocaleDateString()}</p>
              <p className="job-posting-description">{request.description}</p>
              <p className="job-posting-location"><i className="fa fa-map-marker"></i> {request.location}</p>
              <p className="job-posting-budget">Nrs. {request.payAmount}</p>
              <p className="job-posting-duration">Duration : {request.duration}</p>
            </div>
          ))
        )}
      </div>
      <div className="pagination-buttons">
        {currentBookingPage > 1 && (
          <button className="view-previous-btn" onClick={handleBookingViewPrevious} title="View Previous">⟵</button>
        )}
        {currentBookingPage < totalBookingPages && (
          <button className="view-more-btn" onClick={handleBookingViewMore} title="View More"> ⟶</button>
        )}
      </div>

      <h2 id='project-section-title'>My Job Postings</h2>
      <div className="post-cards-container">
        {visibleJobPosts.length === 0 ? (
          <p>You don't have any jobpostings.</p>
        ) : (
          visibleJobPosts.map((job) => (
            <div key={job.id} className="job-posting-card">
              <div className="job-posting-header">
                <h3 className="job-posting-title">{job.jobTitle}</h3>
                <button className="delete-button" onClick={() => handleDelete(job.jpid)}>
                  Delete
                </button>
              </div>
              <p className="job-posting-date">{new Date(job.date).toLocaleDateString()}</p>
              <p className="job-posting-description">{job.description}</p>
              <p className="job-posting-location"><i className="fa fa-map-marker"></i> {job.location}</p>
              <p className="job-posting-budget">Nrs. {job.proposedPayAmount}</p>
              <p className="job-posting-duration">Duration : {job.duration}</p>
            </div>
          ))
        )}
      </div>
      <div className="pagination-buttons">
        {currentPage > 1 && (
          <button className="view-previous-btn" onClick={handleJobViewPrevious} title="View Previous">⟵</button>
        )}
        {currentPage < totalJobPages && (
          <button className="view-more-btn" onClick={handleJobViewMore} title="View More"> ⟶</button>
        )}
      </div>
    </section>
  );
};

export default CDJobPosting;
