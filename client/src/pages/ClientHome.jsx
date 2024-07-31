import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CHeader from "../component/CHeader";
import CTrendingPosts from "../component/CTrendingPosts";
import CAdvantages from "../component/CAdvantages";
import Footer from "../component/Footer";
import Navbarclient from "../component/Navbarclient";

const ClientHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if(userType=="Freelancer"){
      navigate('/login');
    }

    if (!fullName || !userId || !userType || !token) {
      navigate('/login');
    }
  }, [navigate]); // Include navigate in the dependency array

  return (
    <>
      <Navbarclient />
      <CHeader />
      <CTrendingPosts />
      <br /><br />
      <CAdvantages />
      <Footer />
    </>
  );
};

export default ClientHome;
