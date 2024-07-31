import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Paper, Grid, Avatar, Rating, Box } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import NavbarClient from '../component/Navbarclient';
import NavbarFreelancer from '../component/Navbarfreelancer';
import Footer from '../component/Footer';
import axios from 'axios';

const useStyles = {
  root: {
    flexGrow: 1,
    padding: 3,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  paper: {
    width: '80%',
    padding: 40,
    marginTop: '20px',
  },
  mapContainer: {
    height: '400px',
    width: '100%',
    marginTop: '10px',
  },
  noMapData: {
    padding: 2,
    textAlign: 'center',
    color: 'textSecondary',
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: '20px',
  },
  infoPaper: {
    flex: '1 1 30%',
    padding: 20,
    margin: '0 10px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    marginBottom: '10px',
  },
  initialsAvatar: {
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    borderRadius: '50%',
    marginBottom: '10px',
  },
  clientName: {
    fontWeight: 'bold',
    fontSize: '1.2em',
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '5px',
  },
  reviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '10px 20px',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  reviewText: {
    marginTop: '10px',
    fontStyle: 'italic',
  },
};

const Booking = () => {
  const classes = useStyles;
  const location = useLocation();
  const navigate = useNavigate();
  const selectedBooking = JSON.parse(localStorage.getItem('selectedBooking'));
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');
  const { bid, latitude, longitude } = selectedBooking;

  const [client, setClient] = useState(null);
  const [review, setReview] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userType === 'Client') {
      navigate('/login');
      return;
    }
    if (!localStorage.getItem('fullName') || !localStorage.getItem('userId') || !userType || !token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clientResponse, reviewResponse, paymentResponse] = await Promise.all([
          axios.get('http://localhost:5000/freelancer/client-information', {
            params: { bid },
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/freelancer/review-info', {
            params: { bid },
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/payment-info', {
            params: { bid },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setClient(clientResponse.data);
        setReview(reviewResponse.data);
        setPaymentInfo(paymentResponse.data);
      } catch (error) {
        setError('Failed to fetch data.');
        console.error(error);
      }
    };

    fetchData();
  }, [bid, token, navigate, userType]);

  const getProfileImageUrl = (profileImage) => {
    return profileImage ? `http://localhost:5000/uploads/${profileImage}` : null;
  };

  const getInitials = (fullName) => {
    return fullName.split(' ').map((name) => name[0]).join('');
  };

  return (
    <div>
      {userType === 'Client' && <NavbarClient />}
      {userType === 'Freelancer' && <NavbarFreelancer />}
      <div style={classes.root}>
        <Paper elevation={3} style={classes.paper}>
          <Typography variant="h4" gutterBottom fontWeight="bold" className='heading'>
            <span className='highlight'>Booking</span> Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Job Title:</Typography>
              <Typography variant="body1">{selectedBooking.jobTitle}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Date:</Typography>
              <Typography variant="body1">{selectedBooking.date}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Time:</Typography>
              <Typography variant="body1">{selectedBooking.time}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Location:</Typography>
              <Typography variant="body1">{selectedBooking.location}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Pay Amount:</Typography>
              <Typography variant="body1">{selectedBooking.payAmount}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Duration:</Typography>
              <Typography variant="body1">{selectedBooking.duration}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Map Location:</Typography>
              {latitude && longitude ? (
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={classes.mapContainer}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>{selectedBooking.location}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <Typography variant="body1" style={classes.noMapData}>
                  No map data found
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        <div style={classes.infoContainer}>
          {/* Client Information */}
          <Paper elevation={2} style={classes.infoPaper}>
            {client ? (
              <Grid container spacing={2} direction="column">
                <Grid item>
                  {client.profileImage ? (
                    <Avatar src={getProfileImageUrl(client.profileImage)} alt="Profile" style={classes.avatar} />
                  ) : (
                    <div style={classes.initialsAvatar}>
                      <Typography variant="h6">{getInitials(client.fullName)}</Typography>
                    </div>
                  )}
                </Grid>
                <Grid item>
                  <Typography variant="h6" style={classes.clientName}>{client.fullName}</Typography>
                </Grid>
                <Grid item style={classes.iconText}>
                  <EmailIcon style={classes.icon} />
                  <Typography variant="body1">{client.email}</Typography>
                </Grid>
                <Grid item style={classes.iconText}>
                  <PhoneIcon style={classes.icon} />
                  <Typography variant="body1">{client.phoneNo}</Typography>
                </Grid>
              </Grid>
            ) : error ? (
              <Typography variant="body1" color="error">{error}</Typography>
            ) : (
              <Typography variant="body1">Loading...</Typography>
            )}
          </Paper>

          {/* Payment Status */}
          <Paper elevation={2} style={classes.infoPaper}>
            <Typography variant="h6">Payment Status</Typography>
            {paymentInfo ? (
              paymentInfo.message === 'Payment Not Initiated' ? (
                <Typography variant="body1">Payment Not Initiated</Typography>
              ) : (
                <>
                  <Typography variant="h6">Paid Amount:</Typography>
                  <Typography variant="body1">{paymentInfo.paidAmount}</Typography>
                  <Typography variant="h6">Payment Time:</Typography>
                  <Typography variant="body1">{new Date(paymentInfo.time).toLocaleString()}</Typography>
                </>
              )
            ) : error ? (
              <Typography variant="body1" color="error">{error}</Typography>
            ) : (
              <Typography variant="body1">Loading...</Typography>
            )}
          </Paper>

          {/* Review Section */}
          <Paper elevation={2} style={classes.infoPaper}>
            <Typography variant="h6">Review</Typography>
            {review && review.comment ? (
              <Box style={classes.reviewContainer}>
                <Rating value={review.rating} readOnly />
                <Typography variant="body1" style={classes.reviewText}>{review.comment}</Typography>
              </Box>
            ) : error ? (
              <Typography variant="body1" color="error">{error}</Typography>
            ) : (
              <Typography variant="body1">No review made yet</Typography>
            )}
          </Paper>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
