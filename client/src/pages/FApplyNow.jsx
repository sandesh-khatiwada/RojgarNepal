import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import socketIOClient from 'socket.io-client';
import './../css/pageCss/FApplyNow.css';
import Navbarfreelancer from '../component/Navbarfreelancer';

const socket = socketIOClient('http://localhost:5000'); // Replace with your server URL

function FApplyNow() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [jobDetails, setJobDetails] = useState({});
  const [senderEmail, setSenderEmail] = useState('');
  const [responseMessage, setResponseMessage] = useState(''); // State for API response message

  useEffect(() => {
    const jobDetailsFromStorage = JSON.parse(localStorage.getItem('jobDetails'));
    const senderEmailFromStorage = localStorage.getItem('email');
    setJobDetails(jobDetailsFromStorage);
    setSenderEmail(senderEmailFromStorage);
  }, []);

  // Check localStorage on component mount
  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if(userType=="Client"){
      navigate("/login");
    }

    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSend = async () => {
    if (!message) {
      setError('Message cannot be empty.');
      return;
    }

    setError('');
    setResponseMessage(''); // Clear previous response message

    try {
      const token = localStorage.getItem('token');
      const user1id = localStorage.getItem('userId');
      const user2id = jobDetails.userId;

      // Initiate conversation
      const initiateConversationResponse = await fetch(`http://localhost:5000/chat/initiate-conversation?user1id=${user1id}&user2id=${user2id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!initiateConversationResponse.ok) {
        throw new Error('Failed to initiate conversation');
      }

      // Send job application message
      const jobApplicationResponse = await fetch('http://localhost:5000/freelancer/job-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          jobTitle: jobDetails.jobTitle,
          jobDescription: jobDetails.jobDescription,
          receiverEmail: jobDetails.email,
          fullName: jobDetails.fullName,
          senderEmail: senderEmail,
        }),
      });

      if (!jobApplicationResponse.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await jobApplicationResponse.json();
      console.log('Message sent successfully:', data);

      // Emit message to server using Socket.IO
      socket.emit('sendMessage', {
        senderId: user1id, // Replace with actual sender ID
        receiverId: user2id, // Replace with actual receiver details
        content : `In response to the job : ${jobDetails.jobTitle} : 
        ${message}`,
        timestamp: Date.now()
      });

      setSuccess(true);
      // setResponseMessage(data.message); // Set API response message
      setMessage('');

      // localStorage.removeItem("jobDetails");
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again later.');
    }
  };

  return (
    <div>
      <Navbarfreelancer />
      <div className="apply-now">
        <h1 className="apply-title">Apply- <span className='apply-title-orange'> Get Selected</span>-Work-<span className='apply-title-orange'>Earn</span></h1>
        {success && <div className="success-message">Message sent successfully.</div>}
        {error && <div className="error-message">{error}</div>}
        {responseMessage && <div className="api-response-message">{responseMessage}</div>} {/* Display API response message */}
        <div className="apply-card">
          <div className="user-info">
            {/* <img src={electricianprofile} alt="Profile" className="user-image" /> */}
            <h2 className="user-name">{localStorage.getItem('fullName')}</h2>
          </div>
          <textarea
            className="message-box"
            placeholder="Your message/Proposal..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="send-button" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default FApplyNow;
