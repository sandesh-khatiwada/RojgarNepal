import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FHeader from '../component/FHeader';
import FSuggestedJobs from '../component/FSuggestedJobs';
import './../css/pageCss/FHome.css';
import Footer from '../component/Footer';
import Navbarfreelancer from "../component/Navbarfreelancer";

function FreelancerHome() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for required items
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if(userType=="Client"){
      navigate("/login")
     }
     

    if (!fullName || !userId || !userType || !token) {
      // Redirect to /login if any item is missing
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <Navbarfreelancer />
      <div className="freelancer-home">
        <FHeader />
        <FSuggestedJobs />
      </div>
      <Footer />
    </>
  );
}

export default FreelancerHome;
