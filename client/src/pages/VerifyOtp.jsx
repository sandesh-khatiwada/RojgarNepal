import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../css/pageCss/VerifyOtp.css';
import axios from 'axios';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const otpCode = otp.join('');
      const response = await axios.post('http://localhost:5000/user/verify-otp', { emailOtp: otpCode });
      
      console.log('OTP verified successfully', response.data);

      const { email, fullName, token, userId, userType } = response.data;
      localStorage.setItem('email', email);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userType', userType);

      navigate('/profilePhoto', { state: { message: response.data.message, userType: response.data.userType } });
    } catch (error) {
      setErrorMessage('Error verifying OTP: ' + (error.response?.data?.message || error.message));
      console.error('Error verifying OTP:', error.message);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="verify-otp-container">
      <form onSubmit={handleSubmit} className="verify-otp-form">
        <h2>Verify <span>OTP</span></h2>
        <span>Check your email</span>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <br />
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="otp-input"
              required
            />
          ))}
        </div>
        <button type="submit" className="submit-btn">Verify OTP</button>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default VerifyOtp;
