import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import defaultProfileImage from '../images/caretaker.png';
import '../css/pageCss/ChatSystem.css';
import NavbarFreelancer from '../component/Navbarfreelancer';
import NavbarClient from '../component/Navbarclient';

import { useNavigate } from 'react-router-dom'; // Import useNavigate


const socket = socketIOClient('http://localhost:5000'); // Replace with your server URL

const ChatSystem = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [userType, setUserType] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [jobPostData, setJobPostData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    description: '',
    date: '',
    time: '',
    payAmount: '',
    duration: '',
    location: '', // Add location field
    latitude: null, // Initialize latitude and longitude
    longitude: null
  });
  const messageInputRef = useRef(null);
  const conversationRef = useRef(null);

  const scrollToBottom = () => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  };

  useEffect(() => {

    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    } else {
      setUserType(userType);
    }
  }, [navigate]);


  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/chat/conversations?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();

      
        setUsers(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserClick = async (user) => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      

      const response = await fetch(`http://localhost:5000/chat/messages?senderId=${user.otherUser.uid}&receiverId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const messagesData = await response.json();
      if (messagesData.messages.length === 0) {
        throw new Error('No messages found');
      }

      setSelectedUser(user);
      setMessages(messagesData.messages);
      setConversationId(user.conversationId);


      //This uid is freelanceruid, This needs to be attached to reqt body when reqt is sent to 
      // /client/booking-reqt
      console.log(user.otherUser.uid);



      scrollToBottom();

      if (window.innerWidth <= 768) {
        setIsMobileView(true);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    const messageContent = messageInputRef.current.value;
    if (!messageContent.trim()) return;

    socket.emit('sendMessage', {
      senderId: localStorage.getItem('userId'),
      receiverId: selectedUser.otherUser.uid,
      content: messageContent,
      timestamp: Date.now()
    });

    messageInputRef.current.value = '';
  };

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        sendMessage();
      }
    };

    const inputRef = messageInputRef.current;
    if (inputRef) {
      inputRef.addEventListener('keypress', handleKeyPress);
    }

    return () => {
      if (inputRef) {
        inputRef.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, [selectedUser]);

  const getProfileImage = (user) => {
    if (user.otherUser.profileImage) {
      return user.otherUser.profileImage;
    } else {
      return `https://ui-avatars.com/api/?name=${user.otherUser.fullName}&background=random`;
    }
  };

  const goBackToUserList = () => {
    setIsMobileView(false);
    setSelectedUser(null);
  };

  const handleRequestBooking = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/client/jobpost-data?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch job post data');
      }

      const data = await response.json();
      setJobPostData(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setJobPostData(null);
    }

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setJobPostData(null);
    setErrorMessage('');
  };

  const closeFormModal = () => {
    setFormModalVisible(false);
    setFormData({
      jobTitle: '',
      description: '',
      date: '',
      time: '',
      payAmount: '',
      duration: ''
    });
  };

  const handleSelectJobPost = (jobPost) => {
    setFormData({
      jobTitle: jobPost.jobTitle,
      description: jobPost.description,
      date: jobPost.date,
      time: jobPost.time,
      payAmount: jobPost.proposedPayAmount,
      duration: jobPost.duration,
      location: jobPost.location, // Update form data with location
      latitude: jobPost.latitude, // Update form data with latitude
      longitude: jobPost.longitude // Update form data with longitude
    });
  
    setModalVisible(false);
    setFormModalVisible(true);
  };


  const handleConfirmBooking = async () => {
    // Ensure all required data is available
    if (!localStorage.getItem('userId') || !formData.jobTitle || !formData.description ||
        !formData.date || !formData.time || !formData.payAmount || !formData.duration ||
        !formData.location) {
      console.error('Missing data. Unable to confirm booking.');
      return;
    }
  
    const bookingData = {
      userId: localStorage.getItem('userId'),
      jobTitle: formData.jobTitle,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      payAmount: formData.payAmount,
      duration: formData.duration,
      location: formData.location,
      latitude: formData.latitude,
      longitude: formData.longitude,
      freelanceruid: selectedUser.otherUser.uid
    };
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/client/booking-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to request booking');
      }
  
      const bookingMessage = 'Booking request has been made.';
  
      socket.emit('sendMessage', {
        senderId: localStorage.getItem('userId'),
        receiverId: selectedUser.otherUser.uid,
        content: bookingMessage,
        timestamp: Date.now()
      });
  
      closeFormModal();
  
    } catch (error) {
      console.error('Error requesting booking:', error);
      displayMessageModal(error.message, 'error');
    }
  };
  
  
  const displayMessageModal = (message, type) => {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = `message-modal ${type}`;
    modal.textContent = message;
  
    // Append modal to document body
    document.body.appendChild(modal);
  
    // Automatically remove modal after some time (e.g., 3 seconds)
    setTimeout(() => {
      modal.remove();
    }, 3000);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleProfileImageClick = (user) => {
    // Clear any existing user ID from localStorage

    if(localStorage.getItem('clientUid')){
      localStorage.removeItem('clientUid');
    }

    if(localStorage.getItem('freelancerUid')){
      localStorage.removeItem('freelancerUid');
    }
  
    // Store the new user ID based on user type
    if (userType === 'Freelancer') {
      localStorage.setItem('clientUid', user.otherUser.uid);
      navigate(`/clientProfile`); // Navigate to Client profile page
    } else {
      localStorage.setItem('freelancerUid', user.otherUser.uid);
      navigate(`/freelancerProfile`); // Navigate to Client profile page
    }
  };

  
  return (
    <div>
      {userType === 'Client' && <NavbarClient />}
      {userType === 'Freelancer' && <NavbarFreelancer />}
      <div className="chat-system">
        <div className={`user-list ${isMobileView ? 'hidden' : ''}`}>
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.otherUser.uid}
                className={`user ${selectedUser && selectedUser.otherUser.uid === user.otherUser.uid ? 'active' : ''}`}
                onClick={() => handleUserClick(user)}
              >
               <img
                  src={getProfileImage(user)}
                  alt="Profile"
                  className="profile-image"
                  onClick={() => handleProfileImageClick(user)} // Attach click handler
                />
                <div className="user-details">
                <h3>
      {user.otherUser.fullName}
      {user.otherUser.isVerified && (
        <span className="verified-tick">&#x2714;</span> // Blue tick symbol
      )}
    </h3>
                  <p id='recent-message'>{user.recentMessage}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No conversations available</p>
          )}
        </div>
        <div className={`chat-box ${isMobileView ? 'full-screen' : ''}`}>
          {selectedUser ? (
            <div className="conversation" ref={conversationRef}>
              {isMobileView && (
                <button className="go-back" onClick={goBackToUserList}>Go Back</button>
              )}
              <div className="header">
                {userType === 'Client' && <button className='request-booking' onClick={handleRequestBooking}>Request Booking</button>}
                <h2>{selectedUser.otherUser.fullName}</h2>
              </div>
              <div className="messages">
                {messages.map((message) => (
                  <div
                    key={message.mid}
                    className={`message-container ${message.senderId == localStorage.getItem('userId') ? 'sent' : 'received'}`}
                  >
                    {message.senderId != localStorage.getItem('userId') && (
                      <img src={getProfileImage(selectedUser)} alt={selectedUser.otherUser.fullName} className="message-profile-image" />
                    )}
                    <div className={`message ${message.senderId == localStorage.getItem('userId') ? 'sent' : 'received'}`}>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="message-input">
                <input type="text" ref={messageInputRef} placeholder="Type your message..." />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          ) : (
            <div className="placeholder-message">Click on a user to start conversation</div>
          )}
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>X</button>
            {errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : (
              jobPostData && jobPostData.map((jobPost) => (
                <div key={jobPost.jpid} className="job-post">
                  <h3>{jobPost.jobTitle}</h3>
                  <p>{jobPost.description}</p>
                  <p><strong>Proposed Pay Amount:</strong> {jobPost.proposedPayAmount}</p>
                  <p><strong>Location:</strong> {jobPost.location}</p>
                  <button onClick={() => handleSelectJobPost(jobPost)}>Select</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {formModalVisible && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeFormModal}>X</button>
            <h2>Request Booking</h2>
            <form>
              <label>
                Job Title:
                <input type="text" name="jobTitle" value={formData.jobTitle} disabled onChange={handleChange} />
              </label>
              <label>
                Description:
                <textarea name="description" value={formData.description} disabled onChange={handleChange}></textarea>
              </label>
              <label>
                Date:
                <input type="date" name="date" value={formData.date} onChange={handleChange} />
              </label>
              <label>
                Time:
                <input type="time" name="time" value={formData.time} onChange={handleChange} />
              </label>
              <label>
                Pay Amount:
                <input type="text" name="payAmount" value={formData.payAmount} onChange={handleChange} />
              </label>
              <label>
                Duration:
                <input type="text" name="duration" value={formData.duration} onChange={handleChange} />
              </label>
              <button type="button" onClick={handleConfirmBooking}>Confirm</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;
