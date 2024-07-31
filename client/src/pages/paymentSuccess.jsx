import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../css/pageCss/paymentResponse.css";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission state

  useEffect(() => {
    if (!isSubmitted) {
      const transaction_uuid = localStorage.getItem("transaction-uuid");
      const bid = localStorage.getItem("bid-payment");
      const transaction_amount = localStorage.getItem("transaction-amount");

      if (transaction_uuid && bid && transaction_amount) {
        // Send these parameters to your backend
        fetch('http://localhost:5000/store-payment-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bid,
            transaction_uuid,
            transaction_amount,
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Server response:', data);
          if (data.success) {
            setIsSubmitted(true); // Mark as submitted to prevent re-submission
            navigate("/clientDashboard");
          } else {
            console.error('Error storing payment info:', data.error);
          }
        })
        .catch(error => console.error('Error:', error));
      } else {
        console.error('Missing payment information in localStorage');
      }
    }
  }, [location, isSubmitted, navigate]);

  return (
    <div>
      <h1>Payment Successful</h1>
    </div>
  );
};

export default PaymentSuccess;
