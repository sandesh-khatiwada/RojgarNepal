import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../css/pageCss/Login.css';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: '', // Add userType to the form data
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // Send POST request to your API endpoint using Axios
      const response = await axios.post('http://localhost:5000/user/login', formData);


      // Save the response data in local storage

      const { email, fullName, token, userId, userType } = response.data;
      localStorage.setItem('email', email);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userType', userType);
  

      // Redirect user based on userType
      if (userType === 'Client') {
        navigate('/client');
      } else if (userType === 'Freelancer') {
        navigate('/freelancer');
      }
    } catch (error) {
      // Handle error and set the error message
      setErrorMessage('Error logging in: ' + (error.response?.data?.message || error.message));
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login <span>To</span> RojgarNepal</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <br />
        <div className="form-group">
          <label htmlFor="username">Email</label>
          <input
            type="text"
            id="username"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userType">User Type</label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="">Select User Type</option>
            <option value="Client">Client</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        </div>
        <div className="form-group-forgetPass">
          {/* <a href="/forgot-password">Forgot Password?</a> */}
        </div>
        <button type="submit" className="submit-btn">Login</button>
        <br />
        <br />
        <p className="signup-link">Don't have an account? <a href="/signup">Sign up</a></p>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default Login;
