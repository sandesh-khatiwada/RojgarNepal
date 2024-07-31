import React, { useState, useEffect } from 'react';
import './../css/componentCss/CDProfileDescription.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faStar, faMessage, faCoins } from '@fortawesome/free-solid-svg-icons';
import clientprofile from '../images/clientprofile.png';

import CryptoJS from 'crypto-js';


const CDProfileDescription = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    location: '',
    phoneNo: '',
    profileImage: ''
  });

  
  const [bookings, setBookings] = useState([]);
  const [projectStatus, setProjectStatus] = useState('');
  const [reviewData, setReviewData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch profile data
    const fetchProfileData = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`http://localhost:5000/client/profile?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Invalid or malformed token');
          } else {
            setError('Failed to fetch profile data');
          }
          return;
        }

        const data = await response.json();
        setProfileData({
          fullName: data.fullName,
          email: data.email,
          location: data.location,
          phoneNo: data.phoneNo,
          profileImage: data.profileImage
        });
      } catch (err) {
        setError('Internal server error');
      }
    };
    // Fetch bookings and their payment status
    const fetchBookings = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:5000/client/bookings?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Invalid or malformed token');
          } else {
            setError('Failed to fetch bookings');
          }
          return;
        }

        const data = await response.json();
        if (data.length === 0) {
          setBookings([]);
        } else {
          const bookingsWithPaymentStatus = await Promise.all(
            data.map(async (booking) => {
              try {
                const paymentResponse = await fetch(`http://localhost:5000/client/payment-status?bid=${booking.bid}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                const paymentStatus = await paymentResponse.json();
                console.log(`Payment status for booking ${booking.bid}:`, paymentStatus);

                return {
                  ...booking,
                  paymentMade: paymentStatus.paymentMade
                };
              } catch (err) {
                console.error(`Error fetching payment status for booking ${booking.bid}:`, err);
                return {
                  ...booking,
                  paymentMade: false
                };
              }
            })
          );

          setBookings(bookingsWithPaymentStatus);

          const completedTasksCount = data[0].status.dealConfirmed + data[0].status.statusCompleted + data[0].status.paymentDone;
          setProjectStatus(completedTasksCount === 3 ? 'Completed' : 'Active');

          // Initialize review data state
          const initialReviewData = {};
          data.forEach(booking => {
            initialReviewData[booking.bid] = {
              review: '',
              reviewMessage: '',
              rating: 0
            };
          });
          setReviewData(initialReviewData);
        }
      } catch (err) {
        setError('Internal server error');
      }
    };

    fetchProfileData();
    fetchBookings();
  }, []);

  const handleReviewChange = (e, bookingId) => {
    setReviewData(prevData => ({
      ...prevData,
      [bookingId]: {
        ...prevData[bookingId],
        review: e.target.value
      }
    }));
  };

  const handleRatingChange = (index, bookingId) => {
    setReviewData(prevData => ({
      ...prevData,
      [bookingId]: {
        ...prevData[bookingId],
        rating: index + 1
      }
    }));
  };


  //Payment Integration 
  const handlePayment = async (booking) => {
    const { payAmount, bid } = booking;

   
  
    // Generate a unique transaction UUID
    // const transactionUuid = `${booking.bid}`;

    var currentTime = new Date();
    var formattedTime = currentTime.toISOString().slice(2, 10).replace(/-/g, '') + '-' + currentTime.getHours() + currentTime.getMinutes() + currentTime.getSeconds();
    const transactionUuid= `${booking.bid}-${formattedTime}`;

    localStorage.removeItem("bid-payment");
    localStorage.setItem("bid-payment",bid);

    localStorage.removeItem("transaction-uuid")
    localStorage.setItem("transaction-uuid",transactionUuid);

    localStorage.removeItem("transaction-amount")
    localStorage.setItem("transaction-amount",payAmount);
  
    // Set up the payment parameters
    const params = {
      amount: payAmount,
      tax_amount: 0,
      total_amount: payAmount,
      transaction_uuid: transactionUuid,
      product_code: 'EPAYTEST',
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: 'http://localhost:5173/payment-success',
      failure_url: 'http://localhost:5173/payment-failure',
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

  
    // Generate the signature
    const secret = '8gBm/:&EnhH.1/q'; // Replace with your eSewa secret key

    const hash = CryptoJS.HmacSHA256(`total_amount=${params.total_amount},transaction_uuid=${params.transaction_uuid},product_code=${params.product_code}`, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);


    // const signedString = `total_amount=${params.total_amount},transaction_uuid=${params.transaction_uuid},product_code=${params.product_code}`;
    
    // console.log('Signature String:', signedString);
  
    // const hash = CryptoJS.HmacSHA256(signedString, secret);
    // const signature = CryptoJS.enc.Base64.stringify(hash);
  
    // console.log('Generated Signature:', signature);
  
    // Add the signature to the params
    params.signature = signature;
  
    // Create a form and submit it to eSewa
    const form = document.createElement('form');
    form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    form.method = 'POST';
  
    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });
  
    document.body.appendChild(form);
    form.submit();
  };
  const handleReviewSubmit = async (bookingId, freelancerId) => {
    const reviewDataForBooking = reviewData[bookingId] || { review: '', rating: 0 };
    const { review, rating } = reviewDataForBooking;

    if (review.trim() === '') {
      setReviewData(prevData => ({
        ...prevData,
        [bookingId]: {
          ...prevData[bookingId],
          reviewMessage: 'Error: Empty review cannot be submitted.'
        }
      }));
      return;
    }

    if (rating === 0) {
      setReviewData(prevData => ({
        ...prevData,
        [bookingId]: {
          ...prevData[bookingId],
          reviewMessage: 'Error: Please provide a rating.'
        }
      }));
      return;
    }

    // Submit the review to the backend
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/client/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: userId,
          bid: bookingId,
          frid: freelancerId,
          review,
          rating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setReviewData(prevData => ({
          ...prevData,
          [bookingId]: {
            ...prevData[bookingId],
            reviewMessage: errorData.message || 'Could not make review. Please try again later.'
          }
        }));
        return;
      }

      setReviewData(prevData => ({
        ...prevData,
        [bookingId]: {
          ...prevData[bookingId],
          reviewMessage: 'Review made successfully.',
          review: '',  // Clear review input after successful submission
          rating: 0   // Reset rating after successful submission
        }
      }));
    } catch (err) {
      setReviewData(prevData => ({
        ...prevData,
        [bookingId]: {
          ...prevData[bookingId],
          reviewMessage: 'Could not make review. Please try again later.'
        }
      }));
    }
  };

  return (
    <>
      <div className="d-cover-img"> </div>
      <div className='sidebar-and-MyProjects'>
        <div className="side-bar-container">
          <img
            className="d-profile-photo"
            src={profileData.profileImage ? `http://localhost:5000/uploads/${profileData.profileImage}` : `https://ui-avatars.com/api/?name=${profileData.fullName}&background=random`}
            alt="Profile"
          />
          <br /> 
          <h2 className="d-client-name">{profileData.fullName}</h2>
          <p className="d-email">
            Email ID: <span className="d-email-content">{profileData.email}</span>
          </p>
          <p className="d-location">
            <FontAwesomeIcon className="fa-location-dot" icon={faLocationDot} />
            &nbsp;{profileData.location}
          </p>
          <p className="d-phone-number">
            <FontAwesomeIcon className="fa-phone" icon={faPhone} /> {profileData.phoneNo}
          </p>
        </div>

        {/*---------------- My Projects Section-----------------*/}

        <div className='My-Project-Section'>
          <h2 id='project-section-title'>My Bookings</h2>
          {bookings.length === 0 && !error ? (
            <p>No Bookings found</p>
          ) : (
            bookings.map((booking) => (
              <div className="project-card" key={booking.bid}>
                <h3 className='project-title'>{booking.jobTitle}</h3>

                <div className="project-details">
                  <span>Date: {booking.date}</span>
                  <span>Time: {booking.time}</span>
                  <span>Location: {booking.location}</span>
                  <span>Duration: {booking.duration}</span>
                  <span>Pay Amount : {booking.payAmount}</span>

                  <div className="freelancer-info">
                    {booking.AssignedFreelancer.profileImage ? (
                      <img
                        src={`http://localhost:5000/uploads/${booking.AssignedFreelancer.profileImage}`}
                        alt={booking.AssignedFreelancer.fullName}
                        className="freelancer-photo"
                
                      />
                    ) : (
                      <div className="freelancer-initials">
                        {booking.AssignedFreelancer.fullName
                          .split(' ')
                          .map(name => name.charAt(0))
                          .join('')}
                      </div>
                    )}
                    <div className='freelancer-contact-flex'>
                      <div className="freelancer-details">
                        <p className='freelancer-name'>{booking.AssignedFreelancer.fullName}</p>
                        <p className="freelancer-email">{booking.AssignedFreelancer.email}</p>
                  
                      </div>
                      <div className="contact-info">
                        <a href='/chat'><button className="chat-now" title='Chat Now'><FontAwesomeIcon className="fa-message" icon={faMessage} /></button></a>
                        <p className="phone-number">
                          <FontAwesomeIcon className="fa-phone" icon={faPhone} /> {booking.AssignedFreelancer.phoneNo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

      <button
  className='pay-now'
  disabled={booking.paymentMade}
  onClick={() => handlePayment(booking)}
  title={booking.paymentMade ? 'Payment already made' : 'Pay Now'}
>
  {booking.paymentMade ? 'Paid ✅' : 'Pay Now'}
</button>
                {/* Review Section for Each Booking */}
                <div className='review-section'>
                  <h4>Your Review:</h4>
                  <p className={reviewData[booking.bid]?.reviewMessage?.includes('Error') ? 'error-Message' : 'success-Message'}>
                    {reviewData[booking.bid]?.reviewMessage}
                  </p>
                  <textarea
                    rows="4"
                    placeholder="Write your review here..."
                    value={reviewData[booking.bid]?.review || ''}
                    onChange={(e) => handleReviewChange(e, booking.bid)}
                  ></textarea>
                  <div className='rating-section'>
                    <h4>Rate Freelancer:</h4>
                    <div className="rating">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          onClick={() => handleRatingChange(index, booking.bid)}
                          className={index < reviewData[booking.bid]?.rating ? 'selected' : 'star'}
                          style={{ color: index < reviewData[booking.bid]?.rating ? 'gold' : 'grey', cursor: 'pointer'}}
                        >★</span>
                      ))}
                    </div>
                  </div>
                  <button className="submit-review" onClick={() => handleReviewSubmit(booking.bid, booking.AssignedFreelancer.uid)}>Submit Review</button>
                </div>
                {/* Review Section Ends */}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default CDProfileDescription;
