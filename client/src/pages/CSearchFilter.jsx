import React, { useState, useEffect } from 'react';
import './../css/pageCss/CSearchFilter.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faStar, faPaperPlane, faFilter } from '@fortawesome/free-solid-svg-icons';
import Footer from '../component/Footer';
import Navbarclient from '../component/Navbarclient';
import { useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import ChatModal from '../component/ChatModal'; // Import the ChatModal component

const socket = socketIOClient('http://localhost:5000');

const CSearchFilter = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState(0);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchedTalent, setSearchedTalent] = useState('');
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [selectedFreelancer, setSelectedFreelancer] = useState(null); // State for selected freelancer
  const [message, setMessage] = useState(''); // State for message input
  const freelancersPerPage = 6;

  const navigate = useNavigate();
  const searchQuery = localStorage.getItem("searchedTalent") || "";

  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (userType === "Freelancer") {
      navigate("/login");
    }

    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    } else {
      fetchFreelancers();
    }
  }, [navigate]);

  const fetchFreelancers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/client/tallents?searchQuery=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch freelancers');
      }

      const data = await response.json();
      setFreelancers(data);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setSelectedLocations((prev) =>
      prev.includes(value) ? prev.filter((loc) => loc !== value) : [...prev, value]
    );
  };

  const handleRatingChange = (rating) => {
    setSelectedRatings(rating);
  };

  const handleBudgetChange = (event) => {
    setSelectedBudget(event.target.value);
  };


  const handleOfferRequestClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  const handleProfileImageClick = (freelancerUid) => {

    if(localStorage.getItem('freelancerUid')){
    localStorage.removeItem('freelancerUid');
    }
    localStorage.setItem('freelancerUid', freelancerUid);
    navigate('/freelancerProfile');
  };





  const handleSendMessage = async () => {
    if (!message) {
      alert('Message cannot be empty.');
      return;
    }

    const senderId = localStorage.getItem('userId');
    const receiverId = selectedFreelancer.User.uid;
    const token = localStorage.getItem('token');


          // Initiate conversation
          const initiateConversationResponse = await fetch(`http://localhost:5000/chat/initiate-conversation?user1id=${senderId}&user2id=${receiverId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
    
          if (!initiateConversationResponse.ok) {
            throw new Error('Failed to initiate conversation');
          }



    // Emit message to server using Socket.IO
    socket.emit('sendMessage', {
      senderId,
      receiverId,
      content: message,
      timestamp: Date.now()
    });

    setMessage('');
    handleCloseModal();
  };


  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchSearch = searchedTalent === "" || freelancer.serviceName.toLowerCase().includes(searchedTalent.toLowerCase()) ||
                        freelancer.serviceType.toLowerCase().includes(searchedTalent.toLowerCase()) || 
                        freelancer.User.fullName.toLowerCase().includes(searchedTalent.toLowerCase()) ||
                        freelancer.description.toLowerCase().includes(searchedTalent.toLowerCase());

    const matchLocation = selectedLocations.length === 0 || selectedLocations.includes(freelancer.location);
    
    const matchRating = !selectedRatings || freelancer.averageRating >= selectedRatings;

    const freelancerRate = extractRateValue(freelancer.rate);
    
    const matchBudget = selectedBudget === '' || 
                         (selectedBudget === 'less_than_500' && freelancerRate < 500) ||
                         (selectedBudget === '500_1000' && freelancerRate >= 500 && freelancerRate <= 1000) ||
                         (selectedBudget === '1000_10000' && freelancerRate > 1000 && freelancerRate <= 10000) ||
                         (selectedBudget === 'above_10000' && freelancerRate > 10000);

    return matchSearch && matchLocation && matchRating && matchBudget;
  });

  const indexOfLastFreelancer = currentPage * freelancersPerPage;
  const indexOfFirstFreelancer = indexOfLastFreelancer - freelancersPerPage;
  const currentFreelancers = filteredFreelancers.slice(indexOfFirstFreelancer, indexOfLastFreelancer);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredFreelancers.length / freelancersPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbarclient />
      <div className="search-filter-page">
        <div className="filters-section">
          <h3>Filters <FontAwesomeIcon icon={faFilter} /></h3>

          <div className="filter-group">
            <h4>Location</h4>
            <ul>
              {['Kathmandu', 'Bhaktapur', 'Lalitpur'].map((location) => (
                <li key={location}>
                  <input
                    className='talent-filter-input'
                    type="checkbox"
                    value={location}
                    checked={selectedLocations.includes(location)}
                    onChange={handleLocationChange}
                  />
                  <label>{location}</label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4>Ratings</h4>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={selectedRatings >= star ? 'selected' : ''}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
              <p>{selectedRatings} Stars</p>
            </div>
          </div>

          <div className="filter-group">
            <h4>Budget</h4>
            <ul>
              <li>
                <input
                className='talent-filter-input'
                  type="radio"
                  id="budget1"
                  name="budget"
                  value="less_than_500"
                  checked={selectedBudget === 'less_than_500'}
                  onChange={handleBudgetChange}
                />
                <label htmlFor="budget1">Less than 500</label>
              </li>
              <li>
                <input
                  className='talent-filter-input'
                  type="radio"
                  id="budget2"
                  name="budget"
                  value="500_1000"
                  checked={selectedBudget === '500_1000'}
                  onChange={handleBudgetChange}
                />
                <label htmlFor="budget2">500 - 1000</label>
              </li>
              <li>
                <input
                  className='talent-filter-input'
                  type="radio"
                  id="budget3"
                  name="budget"
                  value="1000_10000"
                  checked={selectedBudget === '1000_10000'}
                  onChange={handleBudgetChange}
                />
                <label htmlFor="budget3">1000 - 10000</label>
              </li>
              <li>
                <input
                  className='talent-filter-input'
                  type="radio"
                  id="budget4"
                  name="budget"
                  value="above_10000"
                  checked={selectedBudget === 'above_10000'}
                  onChange={handleBudgetChange}
                />
                <label htmlFor="budget4">Above 10000</label>
              </li>
            </ul>
          </div>
        </div>

        <div className="results-section">
       
          <h2>Search Results</h2>
          {filteredFreelancers.length === 0 ? (
            <p>No Freelancers Found</p>
          ) : (
            <div className="freelancers">
              {currentFreelancers.map((freelancer) => (
                <div className="freelancer-card" key={freelancer.sid}>
                  <div className='freelancer-card-head' >
                  <img 
  className='freelancerprofile' 
  src={renderProfileImage(freelancer.User.profileImage, freelancer.User.fullName)} 
  alt="Profile" 
  onClick={() => handleProfileImageClick(freelancer.User.uid)}
/>

                    <div>
                      <h3>{freelancer.User.fullName}                         {freelancer.User.isVerified && (
        <span className="verified-tick">&#x2714;</span> // Blue tick symbol
      )}</h3>


                      <p className="rating">
                        <span className='star-icon'><FontAwesomeIcon icon={faStar} /></span>
                        {freelancer.averageRating ? Number(freelancer.averageRating).toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>

                  <p className="description">"{freelancer.description}"</p>
                  <div className='location-and-budget'>
                    <p className="price">From {freelancer.rate}</p>
                    <p className="location"><FontAwesomeIcon icon={faLocationDot} /> {freelancer.location}</p>
                  </div>

                  {/* <button className="offer-request-btn">
                    Offer Request <FontAwesomeIcon icon={faPaperPlane} />
                  </button> */}

                  <button className='offer-request-btn' onClick={() => handleOfferRequestClick(freelancer)}>  Offer Request <FontAwesomeIcon icon={faPaperPlane} /></button>

                </div>
              ))}
            </div>
          )}
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            {pageNumbers.map((number) => (
              <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                {number}
              </button>
            ))}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === pageNumbers.length}>
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />

      {showModal && (
        <ChatModal
          message={message}
          onMessageChange={(e) => setMessage(e.target.value)}
          onSendMessage={handleSendMessage}
          onClose={handleCloseModal}
        />
      )}

    </>
  );
};

const extractRateValue = (rateString) => {
  const match = rateString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

const renderProfileImage = (profileImage, fullName) => {
  return profileImage ? 
    `http://localhost:5000/uploads/${profileImage}` :
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`;
};

export default CSearchFilter;
