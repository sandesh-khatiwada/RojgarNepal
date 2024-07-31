import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../css/pageCss/ProfilePhoto.css';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';

const ProfilePhoto = () => {
  const location = useLocation();
  const { message, userType } = location.state || {};
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    if (!profilePhoto) {
      setErrorMessage('Please select a profile photo.');
      return;
    }
  
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(profilePhoto.type)) {
      setErrorMessage('Please upload an image in JPG/JPEG or PNG format.');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', profilePhoto);
    formData.append('email', localStorage.getItem('email'));
    formData.append('userType', localStorage.getItem('userType'));
  
    try {
      const response = await axios.post('http://localhost:5000/user/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const storedUserType = localStorage.getItem('userType');
        if (storedUserType === 'Client') {
          navigate('/client');
        } else if (storedUserType === 'Freelancer') {
          navigate('/freelancer-service');
        }
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage('Error uploading photo: ' + (error.response?.data?.message || error.message));
      console.error('Error uploading photo:', error.message);
    }
  };
  

  const handleSkip = () => {
    if (userType === 'Client') {
      navigate('/client');
    } else if (userType === 'Freelancer') {
      navigate('/freelancer-service');

    }
  };

  return (
    <>
    <Navbar/>
    <div className="profile-photo-container">
      <form onSubmit={handleSubmit} className="profile-photo-form">
        <h2>Upload <span>Profile</span> Photo</h2>
        {message && <div className="success-message">{message}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <br />
        <div className="form-group">
          <label htmlFor="profilePhoto">Profile Photo</label>
          <input
            type="file"
            id="profilePhoto"
            name="profilePhoto"
            onChange={handlePhotoChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Upload Photo</button>
      </form>

      <button className="skip-button" onClick={handleSkip}>Skip</button>
    </div>
    <Footer/>
    </>
  );
};

export default ProfilePhoto;
