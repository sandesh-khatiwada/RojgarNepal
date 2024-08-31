import React, { useState, useEffect } from 'react';
import Header from '../component/Header';
import './../css/componentCss/AllJobPosts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faMoneyBill, faClock, faLocationDot } from '@fortawesome/free-solid-svg-icons';

function AllJobPosts() {
  const [jobPosts, setJobPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const jobsPerPage = 4;

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/admin/jobposts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result.success) {
          setJobPosts(result.jobPosts);
        } else {
          console.error('Failed to fetch job posts:', result.message);
        }
      } catch (error) {
        console.error('Error fetching job posts:', error);
      }
    };

    fetchJobPosts();
  }, []);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobPosts.slice(indexOfFirstJob, indexOfLastJob);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(jobPosts.length / jobsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteClick = (job) => {
    setJobToDelete(job.jpid);
  };


  const handleDeleteConfirm = async (job) => {

    try {

      const jpid =job.jpid;
      const token = localStorage.getItem('token');
  
      const response = await fetch(`http://localhost:5000/admin/jobpost?jpid=${jpid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (result.success) {
        // Successfully deleted job post
        setJobPosts(prevJobPosts => prevJobPosts.filter(job => job.jpid !== jobToDelete));
        setJobToDelete(null);
        setDeleteReason('');
      } else {
        console.error('Failed to delete job post:', result.message);
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error('Error deleting job post:', error);
      // Optionally, show an error message to the user
    }
  };

  const getProfileImageUrl = (profileImage) => {
    return profileImage
      ? `http://localhost:5000/uploads/${profileImage}`
      : '';
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    const names = fullName.split(' ');
    return names.map(name => name.charAt(0)).join('');
  };

  return (
    <>
      <Header bookings={jobPosts} pagename=" Job Posts" />
      <div className="reasontodelete">
        {jobToDelete ? (
          <div className="delete-form">
            <h3>Reason for deleting the job:</h3>
            <textarea 
              value={deleteReason} 
              onChange={handleReasonChange} 
              placeholder="Type your reason here..."
            ></textarea>
            <button 
               
              disabled={!deleteReason.trim()}
            >
              Confirm Delete
            </button>
            <button onClick={() => setJobToDelete(null)}>Cancel</button>
          </div> 
        ) : (
          <div className="adminjobs">
            {currentJobs.map(job => (
              <div className="job-card" key={job.jpid}>
                <div className="profile-image">
                  {job.profileImage ? (
                    <img src={getProfileImageUrl(job.profileImage)} alt="Profile" className='pi' />
                  ) : (
                    <img src={ `https://ui-avatars.com/api/?name=${job.fullName}&background=random`} alt="Profile" className='pi' />
                  )}
                </div>
                {/* <button className="admin-delete-btn" onClick={() => handleDeleteConfirm(job)}>Delete<span className='trashcan'><FontAwesomeIcon icon={faTrashCan} /></span></button> */}
                <div className="jobpost-details">
                  <h3 className='jobpost-fullName'>{job.fullName}</h3>
                  <h3 className='jobpost-title'>{job.jobTitle}</h3> <span className="time"><FontAwesomeIcon icon={faClock} /> {job.createdAt}</span>
                  <br /><p className="job-description">"{job.description}"</p>
                  <div className='pdel'>
                    <p className="payment"><FontAwesomeIcon icon={faMoneyBill} />&nbsp;&nbsp;Nrs.{job.proposedPayAmount}</p>
                    <p className="date">Date: {job.date}</p>
                    <p className="estimated-hours">Estimated Time: {job.duration}</p>
                    <p className="location" title='View on Map'><FontAwesomeIcon icon={faLocationDot} /> <span className='location-details'>{job.location}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="adminpagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
          {pageNumbers.map(number => (
            <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
              {number}
            </button>
          ))}
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === pageNumbers.length}>{">"}</button>
        </div>
      </div>
    </>
  );
}

export default AllJobPosts;
