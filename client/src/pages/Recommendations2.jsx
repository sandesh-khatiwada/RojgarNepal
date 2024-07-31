import React, { useEffect, useState } from 'react';
import './../css/pageCss/Recommendations.css';
import profileImage from "../images/userprofile5.jpg";
import Footer from '../component/Footer';
import Navbarclient from '../component/Navbarclient';
import { useNavigate } from 'react-router-dom';

const Recommendation = () => {
  const [jobData, setJobData] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if(userType=="Freelancer"){
      navigate("/login");
    }


    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    } else {
      const savedData = localStorage.getItem('jobPostData');
      if (savedData) {
        console.log(savedData);
        setJobData(JSON.parse(savedData));
      }
    }
  }, [navigate]); // Add navigate to dependencies


  const handleJobPost = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assume userId is stored in localStorage

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
      navigate("/client")
    } catch (error) {
      console.error('Error posting job:', error);
      setMessage('Failed to post job.');
    }
  };

  const freelancers = [
    {
      profileImage: profileImage,
      fullName: "Sandesh Khatiwada",
      rating: "4.5",
      serviceDescription: "I offer web dev service",
      location: "Kathmandu",
      status: "Available",
      projects: "5",
      rate: "500"
    },
    {
      profileImage: profileImage,
      fullName: "Sandesh Khatiwada",
      rating: "4.5",
      serviceDescription: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita voluptatibus doloribus, itaque provident odit, vel a ullam ea debitis animi, dicta aut? Ea reiciendis commodi nobis. Voluptatibus eaque sapiente, distinctio excepturi impedit dolores ex, expedita doloribus, soluta qui amet veritatis dicta iure rem. Id eaque fuga assumenda est, nisi veritatis?`,
      location: "Kathmandu",
      status: "Available",
      projects: "5",
      rate: "500"
    },
    {
      profileImage: profileImage,
      fullName: "Sandesh Khatiwada",
      rating: "4.5",
      serviceDescription: "I offer web dev service",
      location: "Kathmandu",
      status: "Available",
      projects: "5",
      rate: "500"
    },
    {
      profileImage: profileImage,
      fullName: "Sandesh Khatiwada",
      rating: "4.5",
      serviceDescription: "I offer web dev service",
      location: "Kathmandu",
      status: "Available",
      projects: "5",
      rate: "500"
    }
  ];

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
            {freelancers.map((freelancer, index) => (
              <div key={index} className="freelancer-item">
                <div className="profile-info">
                  <div className="image">
                    <img src={freelancer.profileImage} alt="Profile" />
                  </div>
                  <div className="description">
                    <div className="name">
                      <p>{freelancer.fullName}</p>
                    </div>
                    <div className="rating">
                      <p>Rating: {freelancer.rating}</p>
                    </div>
                  </div>
                </div>
                <div className="additional-info">
                  <p>Location: {freelancer.location}</p>
                  <div className="status-projects">
                    <p className="status">Status: {freelancer.status}</p>
                    <p className="projects">Projects: {freelancer.projects}</p>
                  </div>
                  <p>Rate: {freelancer.rate}</p>
                </div>
                <div className="service-description">{freelancer.serviceDescription}</div>
                <button>Invite Now</button>
              </div>
            ))}
          </div>

          <div className="job-post-options">
            <button onClick={handleJobPost}>Make a Job Post</button>
            <a href="/client">Skip for Now</a>
          </div>
        </div>
        {message && <p>{message}</p>}
      </div>
      <Footer />
    </>
  );
};

export default Recommendation;