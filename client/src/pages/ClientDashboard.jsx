import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../component/Footer';
import CDProfileDescription from '../component/CDProfileDescription';
import CDJobPosting from '../component/CDJobPosting';
import Navbarclient from '../component/Navbarclient';

const ClientDashboard = () => {
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
    }
  }, [navigate]); // Include navigate in the dependency array

  return (
    <>
      <Navbarclient />
      <div>
        <CDProfileDescription />
        <CDJobPosting />
      </div>
      <Footer />
    </>
  );
};

export default ClientDashboard;
