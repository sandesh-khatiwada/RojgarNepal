import React, { useState, useEffect } from 'react';
import './../css/pageCss/FSearchFilter.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faMoneyBill, faClock, faPaperPlane, faFilter } from '@fortawesome/free-solid-svg-icons';
import Footer from '../component/Footer';
import Navbarfreelancer from '../component/Navbarfreelancer';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FSearchFilter() {
  const [jobs, setJobs] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(20000);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedJobs, setExpandedJobs] = useState({}); // State for expanded jobs
  const jobsPerPage = 4;

  const navigate = useNavigate();
  const searchedQuery = localStorage.getItem("searchedQuery") || "";

  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (userType === "Client") {
      navigate("/login");
    }

    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    } else {
      fetchJobs();
    }
  }, [navigate]);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/freelancer/job-posts?query=${encodeURIComponent(searchedQuery)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setSelectedLocations((prev) =>
      prev.includes(value) ? prev.filter((loc) => loc !== value) : [...prev, value]
    );
  };

  const handlePaymentChange = (event) => {
    setSelectedPayment(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleApply = (job) => {
    localStorage.setItem('jobDetails', JSON.stringify({
      email: job.User.email,
      fullName: job.User.fullName,
      userId: job.User.uid,
      jobTitle: job.jobTitle,
      jobDescription: job.description,
    }));
    window.open('/applynow', '_blank');
  };

  const handleExpand = (jobId) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };


  const handleProfileClick = (clientUid) => {

    if(localStorage.getItem("clientUid")){
      localStorage.removeItem('clientUid');

    }

    localStorage.setItem('clientUid', clientUid);
    navigate('/clientProfile');
  };

  const filteredJobs = jobs.filter((job) => {
    const matchJobTitle = searchedQuery === "" || job.jobTitle.toLowerCase().includes(searchedQuery.toLowerCase());
    const matchLocation = selectedLocations.length === 0 || selectedLocations.map(loc => loc.toLowerCase()).includes(job.location.toLowerCase());
    const matchPayment = job.proposedPayAmount <= selectedPayment;
    const matchCategory = !selectedCategory || job.serviceType.includes(selectedCategory);

    return matchJobTitle && matchLocation && matchPayment && matchCategory;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredJobs.length / jobsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbarfreelancer />
      <div className="search-filter-page">
        <div className="filters-section">
          <h3>Filters &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <FontAwesomeIcon icon={faFilter} /></h3>

          <div className="filter-group">
            <h4>Job Category</h4>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Painter">Painter</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Dish Washer">Dish Washer</option>
              <option value="Laundry">Laundry</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Technician">Technician</option>
              <option value="Selroti Maker">Selroti Maker</option>
              <option value="Tuition Teacher">Tuition Teacher</option>
              <option value="Sweeper">Sweeper</option>
              <option value="Repair-man">Repair-man</option>
              <option value="Gardener">Gardener</option>
              <option value="Pandit">Pandit</option>
              <option value="Care Taker">Care Taker</option>
            </select>
          </div>

          <div className="filter-group">
            <h4>Location</h4>
            <ul>
              {['Kathmandu', 'Bhaktapur', 'Lalitpur'].map((location) => (
                <li key={location}>
                  <input
                    type="checkbox"
                    value={location}
                    checked={selectedLocations.includes(location)}
                    onChange={handleLocationChange}
                    className="small-checkbox"
                  />
                  <label>{location}</label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4>Proposed Payment</h4>
            <input type="range" min="0" max="20000" value={selectedPayment} onChange={handlePaymentChange} />
            <button className="go-button">Nrs. 0 - {selectedPayment}</button>
          </div>
        </div>

        <div className="results-section">
          {currentJobs.length === 0 ? (
            <p className="no-jobs-message">No Job Postings found</p>
          ) : (
            <>
              <div className="jobs">
                {currentJobs.map((job) => (
                  <div className="job-card" key={job.jpid}>
                    <div className='user-profile-image'  onClick={() => handleProfileClick(job.User.uid)}>
                      {job.User.profileImage ? (
                        <img src={`http://localhost:5000/uploads/${job.User.profileImage}`} alt="Profile" />
                      ) : (
                        <span className='client-initials'>{job.User.fullName.charAt(0)}</span>
                      )}
                    </div>
                    <button className="apply-btn" onClick={() => handleApply(job)}>
                      Apply Now <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                    <div className="jobpost-details">
                      <h2 className='jobpost-user-name'>{job.User.fullName}</h2>
                      <h3 className='jobpost-title'>{job.jobTitle}</h3>
                      <span className="time"><FontAwesomeIcon icon={faClock} /> {job.time}</span>
                      <p className="job-description">"{job.description}"</p>
                   
                      <div className='pdel'>
                        <p className="payment"><FontAwesomeIcon icon={faMoneyBill} />&nbsp; Nrs. {job.proposedPayAmount}</p>
                        <p className="date">Date: {job.date}</p>
                        <p className="estimated-hours">Duration : {(job.duration)}</p>
                        <p className="location"><FontAwesomeIcon icon={faLocationDot} /> {job.location}</p>
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
                            <p>No location data available for this job.</p>
                          )}
                        </div>
                      )}
                      <button className="expand-btn" onClick={() => handleExpand(job.jpid)}>
                        {expandedJobs[job.jpid] ? 'Hide Map' : 'Show Map'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pagination">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={currentPage === number ? 'active' : ''}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FSearchFilter;
