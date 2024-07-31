import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Navbarfreelancer from '../component/Navbarfreelancer';
import Footer from '../component/Footer';
import styles from '../css/pageCss/ProfileVerification.module.css';

const ProfileVerification = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [identityDoc, setIdentityDoc] = useState(null);
  const [workDoc1, setWorkDoc1] = useState(null);
  const [workDoc2, setWorkDoc2] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    const userType = localStorage.getItem('userType');


    if(userType=="Client"){
      navigate("/login");
    }

    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    }
  }, [navigate, userId, token]); // Ensure userId and token are included as dependencies

  const handleFileChange = (event, setFile) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append('userId', userId);
    formData.append('email', email);
    formData.append('identity-doc', identityDoc);
    formData.append('work-doc1', workDoc1);
    if (workDoc2) {
      formData.append('work-doc2', workDoc2);
    }

    try {
      const response = await fetch('http://localhost:5000/freelancer/profile-verification', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setModalMessage(errorData.message);
        setIsModalOpen(true);
        throw new Error(errorData.message || 'Failed to submit documents for verification');
      }

      const data = await response.json();
      setModalMessage('Your documents have been submitted, any further information regarding your profile verification will be sent to you on e-mail');
      setIsModalOpen(true);
      console.log('Success:', data);
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error('Error:', error.message);
      // Handle error (e.g., show an error message)
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbarfreelancer />
      <div className={styles.container}>
        <h1 className='profile-verification-title'>Profile <span className="highlight">Verification</span></h1>
        <br /><br />
        <h4>Identity document and at least one Work Experience/Training document is needed</h4> <br /><br /><br />
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="identityDoc">Identity Document (Citizenship or NID card)</label>
            <input
              type="file"
              id="identityDoc"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => handleFileChange(e, setIdentityDoc)}
              required
            />
          </div>
          <br /><br /><br />
          <div className={styles.formGroup}>
            <label htmlFor="workDoc1">Work Experience/Training Documents</label>
            <input
              type="file"
              id="workDoc1"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => handleFileChange(e, setWorkDoc1)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="file"
              id="workDoc2"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => handleFileChange(e, setWorkDoc2)}
            />
          </div>
          <button type="submit" className={styles.submitButton}>Submit for Verification</button>
        </form>
      </div>
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>{modalMessage}</p>
            <button onClick={handleCloseModal}>OK</button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ProfileVerification;
