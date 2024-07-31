import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/pageCss/paymentResponse.css';

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/clientDashboard');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
  }, [navigate]);

  return (
    <div>
      <h1>Payment Failed. Try again later</h1>
    </div>
  );
};

export default PaymentFailure;
