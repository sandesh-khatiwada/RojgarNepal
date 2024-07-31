import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './../css/componentCss/FSuggestedJobs.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMoneyBill, faClock, faLocationDot } from '@fortawesome/free-solid-svg-icons';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './../css/pageCss/JobPost.css';

// Default fallback image URL
const defaultImage = '../assets/default-profile-image.jpg'; // Adjust path as per your project structure

function FSuggestedJobs() {
  const [jobs, setJobs] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 4;

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/freelancer/recent-jobs', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setJobs(response.data.data);
          console.log(response.data.data);
        } else {
          console.error('Failed to fetch jobs:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(jobs.length / jobsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExpand = (jobId) => {
    // Toggle expanded state of the job with given jobId
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleApply = (job) => {
    // Save the job details to localStorage
    localStorage.setItem('jobDetails', JSON.stringify({
      email: job.User.email,
      fullName: job.User.fullName,
      userId:job.User.uid,
      jobTitle: job.jobTitle,
      jobDescription: job.description,

    }));
    // Navigate to the apply now page
    window.open('/applynow', '_blank');
  };

  return (
    <div className="suggested-jobs">
      <div className='title-section'>
        <h1 className='jobs-title'>Jobs For You</h1>
      </div>
      <p className='jobs-subtitle'>Discover the Job Listings in the platform.</p>
      <br />
      <div className="jobs">
        {currentJobs.map((job) => (
          <div className="job-card" key={job.jpid}>
            <div className="profile-image">
              {job.User.profileImage ? (
                <img
                  className='profile-image'
                  src={job.User.profileImage} // Use profileImage if available
                  alt="Profile"
                />
              ) : (
                <div className="client-initials">
                  {job.User.fullName.charAt(0)}
                </div>
              )}
            </div>
            <button className="apply-btn" onClick={() => handleApply(job)}>
              Apply Now <span className='paperplane'><FontAwesomeIcon icon={faPaperPlane} /></span>
            </button>
            <div className="jobpost-details">
              <h3>{job.User.fullName}</h3>
              <h3 className='jobpost-title'>{job.jobTitle}</h3>
              <span className="time"><FontAwesomeIcon icon={faClock} /> {job.time}</span>
              <br /><p className="job-description">"{job.description}"</p>
              <p className='jobpost-servicetype'>ServiceType : {job.serviceType}</p>
              <div className='pdel'>
                <p className="payment"> <FontAwesomeIcon icon={faMoneyBill} />&nbsp;&nbsp;Nrs.{job.proposedPayAmount} </p>
                <p className="date">Date: {job.date}</p>
                <p className="estimated-hours"> Duration : {job.duration}</p>
                <p className="location" title='View on Map'><FontAwesomeIcon icon={faLocationDot} /> <span className='location-details'>{job.location}</span>  </p>
              </div>
              {/* Expandable section */}
              {expandedJobs[job.jpid] && (
                <div className="expandable-section">
                  {job.latitude && job.longitude ? (
                    <MapContainer center={[job.latitude, job.longitude]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[job.latitude, job.longitude]}>
                        <Popup>
                          {job.location}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <p>No map data found</p>
                  )}
                </div>
              )}
              <button className="expand-btn" onClick={() => handleExpand(job.jpid)}>
                {expandedJobs[job.jpid] ? 'Hide' : 'View on Map'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
        {pageNumbers.map(number => (
          <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
            {number}
          </button>
        ))}
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === pageNumbers.length}>{">"}</button>
      </div>
    </div>
  );
}

export default FSuggestedJobs;
