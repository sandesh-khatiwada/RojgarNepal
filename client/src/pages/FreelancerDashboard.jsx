import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbarfreelancer from '../component/Navbarfreelancer';
import Footer from '../component/Footer';
import styles from '../css/pageCss/FreelancerDashboard.module.css';
import image from "../images/caretaker.png";
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:5000'); 

const FreelancerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const freelancerName = localStorage.getItem("fullName");
  const email = localStorage.getItem("email");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    // Check localStorage for required items

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const freelancerName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const userType = localStorage.getItem("userType");

    if(userType=="Client"){
      navigate("/login")
     }

    if (!userId || !token || !freelancerName || !email) {
      navigate('/login');
    } else {
      fetchProfileData();
      fetchBookings();
      fetchBookingRequests();
    }
  }, [navigate, userId, token, freelancerName, email]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/freelancer/profile?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile data");
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/freelancer/bookings?freelanceruid=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/freelancer/booking-requests?freelanceruid=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch booking requests");
      }

      const data = await response.json();
      setBookingRequests(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (index, request) => {
    const brid = request.brid;

    try {
      const response = await fetch(`http://localhost:5000/freelancer/booking?brid=${brid}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept booking request");
      }

      const senderId = localStorage.getItem("userId");
      const receiverId = request.uid;

      // Emit message to server using Socket.IO
      socket.emit('sendMessage', {
        senderId: senderId,
        receiverId: receiverId,
        content: `Accepted your booking request`,
        timestamp: Date.now()
      });

      const updatedBookingRequests = [...bookingRequests];
      updatedBookingRequests.splice(index, 1);
      setBookingRequests(updatedBookingRequests);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReject = async (index, request) => {
    const brid = request.brid;

    try {
      const response = await fetch(`http://localhost:5000/freelancer/booking-request?brid=${brid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject booking request");
      }

      const senderId = localStorage.getItem("userId");
      const receiverId = request.uid;

      // Emit message to server using Socket.IO
      socket.emit('sendMessage', {
        senderId: senderId,
        receiverId: receiverId,
        content: `Rejected your booking request`,
        timestamp: Date.now()
      });

      const updatedBookingRequests = [...bookingRequests];
      updatedBookingRequests.splice(index, 1);
      setBookingRequests(updatedBookingRequests);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewBooking = (booking) => {
    localStorage.removeItem('selectedBooking');
    localStorage.setItem('selectedBooking', JSON.stringify(booking));
    navigate('/booking');
  };

  const currentDate = new Date();
  const pastBookings = bookings.filter(booking => new Date(booking.date) < currentDate);
  const futureBookings = bookings.filter(booking => new Date(booking.date) >= currentDate);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Navbarfreelancer />
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.profileInfo}>
            <img src={profile.profileImage ? `http://localhost:5000/uploads/${profile.profileImage}` : `https://ui-avatars.com/api/?name=${profile.fullName}&background=random`} alt="Profile" className={styles.profileImage} />
            <h2 className={styles.freelancerName}>{profile.fullName}       {profile.isVerified && (
        <span className="verified-tick">&#x2714;</span> // Blue tick symbol
      )}</h2>
            <p className={styles.email}><i className="fas fa-envelope"></i> {profile.email}</p>
            <p className={styles.phone}><i className="fas fa-phone"></i> {profile.phoneNo}</p>
            <p className={styles.location}><i className="fas fa-map-marker-alt"></i> {profile.location}</p>
            <p className={styles.rating}><i className="fas fa-star"></i> {profile.rating ? profile.rating.slice(0,3) : '0'}</p>
          </div>
        </div>
        <div className={styles.mainContent}>
          <h1>Hello <span className={styles.freelancerNameHighlight}>{profile.fullName}</span>! 👋</h1>

          <h2>Your <span className={styles.highlight}>Bookings</span></h2>
          {futureBookings.length === 0 ? (
            <div className={styles.section}>You don't have any bookings yet.</div>
          ) : (
            futureBookings.map((booking, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.booking}>
                  <p>Job Title: {booking.jobTitle}</p>
                  <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <p>Time: {booking.time}</p>
                  <p>Location: {booking.location}</p>
                  {booking.latitude && booking.longitude ? (
                    <MapContainer center={[booking.latitude, booking.longitude]} zoom={13} scrollWheelZoom={false} className={styles.map}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[booking.latitude, booking.longitude]}>
                        <Popup>
                          {booking.location}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className={styles.noLocation}>No map location available</div>
                  )}
                  <p>Pay Amount: {booking.payAmount}</p>
                  <p>Duration: {booking.duration}</p>
                  <button className={styles.viewButton} onClick={() => handleViewBooking(booking)}>
                    <i className="fas fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))
          )}

          <h2>Your <span className={styles.highlight}>Past Bookings</span></h2>
          {pastBookings.length === 0 ? (
            <div className={styles.section}>You don't have any past bookings.</div>
          ) : (
            pastBookings.map((booking, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.booking}>
                  <p>Job Title: {booking.jobTitle}</p>
                  <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <p>Time: {booking.time}</p>
                  <p>Location: {booking.location}</p>
                  <p>Pay Amount: {booking.payAmount}</p>
                  <p>Duration: {booking.duration}</p>
                  <button className={styles.viewButton} onClick={() => handleViewBooking(booking)}>
                    <i className="fas fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))
          )}

          <h2>Booking <span className={styles.highlight}>Requests</span></h2>
          {bookingRequests.length === 0 ? (
            <div className={styles.section}>You don't have any booking requests.</div>
          ) : (
            bookingRequests.map((request, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.bookingRequest}>
                  <p>Job Title: {request.jobTitle}</p>
                  <p>Date: {new Date(request.date).toLocaleDateString()}</p>
                  <p>Time: {request.time}</p>
                  <p>Location: {request.location}</p>
                  <button className={styles.acceptButton} onClick={() => handleAccept(index, request)}>
                    <i className="fas fa-check"></i> Accept
                  </button>
                  <button className={styles.rejectButton} onClick={() => handleReject(index, request)}>
                    <i className="fas fa-times"></i> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FreelancerDashboard;
