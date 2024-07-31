import React, { useEffect, useState } from 'react';
import './../css/pageCss/Recommendations.css';
import profileImage from "../images/userprofile5.jpg";
import Footer from '../component/Footer';
import Navbarclient from '../component/Navbarclient';
import { useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { LocationOn, Email, Phone, MonetizationOn } from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';

const socket = socketIOClient('http://localhost:5000'); // Replace with your server URL

const Recommendation = () => {
  const [jobData, setJobData] = useState(null);
  const [message, setMessage] = useState('');
  const [freelancers, setFreelancers] = useState([]);
  const [invitedFreelancers, setInvitedFreelancers] = useState([]);

  const navigate = useNavigate();

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
      const savedData = localStorage.getItem('jobPostData');
      if (savedData) {
        console.log(savedData);
        setJobData(JSON.parse(savedData));
        
        // Fetch recommended freelancers
        const fetchRecommendations = async () => {
          try {
            const response = await fetch(`http://localhost:5000/client/freelancer-recommendation?savedData=${savedData}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
  
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
  
            const data = await response.json();
            setFreelancers(data); // The API response is an array of freelancers
          } catch (error) {
            console.error('Error fetching recommendations:', error);
          }
        };
  
        fetchRecommendations();
      }
    }
  }, [navigate]);

  const handleInvite = async (freelancer) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!token || !userId || !jobData) {
      setMessage('Missing required information.');
      return;
    }

    try {
      // Initiate conversation
      const initiateConversationResponse = await fetch(`http://localhost:5000/chat/initiate-conversation?user1id=${userId}&user2id=${freelancer.user.uid}`, {
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
        senderId: userId,
        receiverId: freelancer.user.uid,
        content: `I would like to invite you for a job : ${jobData.jobTitle} , About Job : ${jobData.description} , Proposed Payment: ${jobData.proposedPayAmount}, Location: ${jobData.location}, Date: ${jobData.date} ,Time: ${jobData.time} ,Duration: ${jobData.duration}`,
        timestamp: Date.now()
      });

      // Add freelancer to the invited list
      setInvitedFreelancers([...invitedFreelancers, freelancer.user.uid]);
      // setMessage('Invitation sent successfully!');
    } catch (error) {
      console.error('Error inviting freelancer:', error);
      setMessage('Failed to send invitation.');
    }
  };

  const handleJobPost = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId || !jobData) {
      setMessage('Missing required information.');
      return;
    }

    const jobPostData = {
      userId,
      jobTitle: jobData.jobTitle,
      description: jobData.description,
      date: jobData.date,
      time: jobData.time,
      serviceType: jobData.serviceType,
      location: jobData.location,
      latitude: jobData.coordinates.lat,
      longitude: jobData.coordinates.lng,
      proposedPayAmount: jobData.proposedPayAmount,
      duration: jobData.duration
    };

    try {
      const response = await fetch('http://localhost:5000/client/post-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobPostData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Job posted successfully:', responseData);
      setMessage('Job posted successfully!');
      localStorage.removeItem("jobPostData");
      navigate("/client");
    } catch (error) {
      console.error('Error posting job:', error);
      setMessage('Failed to post job.');
    }
  };

  return (
    <>
      <Navbarclient />
      <div className="main-container">
        <div className="heading-div">
          <h1>Best <span className="highlight">Matches</span> for your job</h1>
          <p>Here are the top freelancers suited for your project based on your requirements</p>
        </div>

        <div className="recommendation-container">
          {jobData ? (
            <div className="job-summary">
              <h2>Job Summary</h2>
              <p>Job Title: <br /> <span className='title'>{jobData.jobTitle}</span> </p>
              <p>Description:<br /> {jobData.description}</p>
              <p>Payment Offered: {jobData.proposedPayAmount}</p>
              <p>Date: {jobData.date}</p>
              <p>Time: {jobData.time}</p>
              <p>Service Type: {jobData.serviceType}</p>
              <p>Location: {jobData.location}</p>
              <p>Duration: {jobData.duration}</p>
            </div>
          ) : (
            <p>No job data found.</p>
          )}

          <div className="freelancers-list">
            {freelancers.length > 0 ? (
              freelancers.map((freelancer, index) => (
                <div key={index} className="freelancer-item">
                  <div className="profile-info">
                    <div className="image">
                      <img src={freelancer.user.profileImage ? `http://localhost:5000/uploads/${freelancer.user.profileImage}` : `https://ui-avatars.com/api/?name=${freelancer.user.fullName}&background=random`} alt="Profile" />
                    </div>
                    <div className="description">
                      <div className="name">
                        <p>{freelancer.user.fullName}</p>
                      </div>
                      <br />
                      <div className="rating">
                      <StarIcon></StarIcon> <p className='highlight'>{Number(freelancer.user.averageRating).toFixed(1)|| '0'} </p> 
                      <p className='highlight'>Out of {freelancer.user.reviewCount} reviews</p>
                      </div>
                    </div>
                  </div>
                  <div className="additional-info">
                    <p><LocationOn fontSize="small" /> {freelancer.location}</p>
                    <p><Email fontSize="small" /> {freelancer.user.email || 'N/A'}</p> 
                    <p><Phone fontSize="small" /> {freelancer.user.phoneNo || 'N/A'}</p>
                    <p><MonetizationOn fontSize="small" /> {freelancer.rate}</p>
                  </div> <br /> <br />
                  <div className="service-description">{freelancer.description}</div>

                  <br /><br />
                  <button
                    onClick={() => handleInvite(freelancer)}
                    disabled={invitedFreelancers.includes(freelancer.user.uid)}
                    className='invite-button'
                  >
                    {invitedFreelancers.includes(freelancer.user.uid) ? 'Invited' : 'Invite Now'}
                  </button>
                </div>
              ))
            ) : (
              <p className='unsuccesful-message'>Unfortunately, No Freelancers found for your requirement. <br /> What about making a job post? 🙂</p>
            )}
          </div>

          <div className="job-post-options">
            <button onClick={handleJobPost}>Make a Job Post</button>
          </div>
        </div>
        {message && <p>{message}</p>}
      </div>
      <Footer />
    </>
  );
};

export default Recommendation;
