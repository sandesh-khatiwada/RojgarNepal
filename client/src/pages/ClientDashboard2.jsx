import React, { useEffect, useState } from 'react';
import Navbarclient from '../component/Navbarclient';
import Footer from '../component/Footer';
import styles from '../css/pageCss/ClientDashboard.module.css'; // Import CSS module for scoped styling
import image from "../images/caretaker.png";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Fetch Booking Requests
    const fetchBookingRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/client/booking-requests?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookingRequests(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch booking requests');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    // Fetch Bookings
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/client/bookings?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch bookings');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    // Fetch Job Posts
    const fetchJobPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/client/job-posts?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJobPosts(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch job posts');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchBookingRequests();
    fetchBookings();
    fetchJobPosts();
    setLoading(false);
  }, []); // Empty dependency array ensures this effect runs only once

  // Static data for demonstration (replace with API fetched data in actual implementation)
  const clientName = localStorage.getItem("fullName");
  const email = localStorage.getItem("email");
  const profileImage = image; // Replace this with API fetched image URL in actual implementation
  const phoneNo = "123-456-7890"; // Static for now
  const location = "Kathmandu, Nepal"; // Static for now

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Navbarclient />
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.profileInfo}>
            <img src={profileImage} alt="Profile" className={styles.profileImage} />
            <h2 className={styles.clientName}>{clientName}</h2>
            <p className={styles.email}><i className="fas fa-envelope"></i> {email}</p>
            <p className={styles.phone}><i className="fas fa-phone"></i> {phoneNo}</p>
            <p className={styles.location}><i className="fas fa-map-marker-alt"></i> {location}</p>
          </div>
        </div>
        <div className={styles.mainContent}>
          <h1>Hello <span className={styles.clientNameHighlight}>{clientName}</span>! 👋</h1>

          <h2>Your <span className={styles.highlight}>Bookings</span></h2>
          {bookings.length === 0 ? (
            <div className={styles.section}>You don't have any bookings yet.</div>
          ) : (
            bookings.map((booking, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.booking}>
                  <p>Date: {booking.date}</p>
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
                    <div>No map location available</div>
                  )}
                  <p>Pay Amount: {booking.payAmount}</p>
                  <p>Duration: {booking.duration}</p>
                  <button className={styles.viewButton}>
                    <i className="fas fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))
          )}

          <h2>Your <span className={styles.highlight}>Booking Requests</span></h2>
          {bookingRequests.length === 0 ? (
            <div className={styles.section}>You don't have any booking requests yet.</div>
          ) : (
            bookingRequests.map((request, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.bookingRequest}>
                  <p>Date: {request.date}</p>
                  <p>Time: {request.time}</p>
                  <p>Location: {request.location}</p>
                  {request.latitude && request.longitude ? (
                    <MapContainer center={[request.latitude, request.longitude]} zoom={13} scrollWheelZoom={false} className={styles.map}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[request.latitude, request.longitude]}>
                        <Popup>
                          {request.location}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div>No map location available</div>
                  )}
                  <p>Pay Amount: {request.payAmount}</p>
                  <p>Duration: {request.duration}</p>
                </div>
              </div>
            ))
          )}

          <h2>Your <span className={styles.highlight}>Job Posts</span></h2>
          {jobPosts.length === 0 ? (
            <div className={styles.section}>You don't have any job posts yet.</div>
          ) : (
            jobPosts.map((jobPost, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.jobPost}>
                  <p>Job Title: {jobPost.jobTitle}</p>
                  <p>Description: {jobPost.description}</p>
                  <p>Date: {jobPost.date}</p>
                  <p>Time: {jobPost.time}</p>
                  <p>Service Type: {jobPost.serviceType}</p>
                  <p>Location: {jobPost.location}</p>
                  {jobPost.latitude && jobPost.longitude ? (
                    <MapContainer center={[jobPost.latitude, jobPost.longitude]} zoom={13} scrollWheelZoom={false} className={styles.map}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[jobPost.latitude, jobPost.longitude]}>
                        <Popup>
                          {jobPost.location}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div>No map location available</div>
                  )}
                  <p>Proposed Pay Amount: {jobPost.proposedPayAmount}</p>
                  <p>Duration: {jobPost.duration}</p>
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

export default ClientDashboard;
