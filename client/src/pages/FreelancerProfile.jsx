import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbarclient from '../component/Navbarclient';
import Footer from '../component/Footer';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';

const FreelancerProfile = () => {
  const [profileData, setProfileData] = useState({
    profileImage: '',
    fullName: '',
    email: '',
    phoneNo: '',
    location: '',
    latitude: 0,
    longitude: 0,
  });
  const [serviceData, setServiceData] = useState({
    serviceName: '',
    serviceType: '',
    description: '',
    rate: '',
    rating: '',
    noOfRating: '',
    latitude: null,
    longitude: null,
  });
  const [pastProjects, setPastProjects] = useState([]);
  const [serviceError, setServiceError] = useState('');
  const [projectsError, setProjectsError] = useState('');

  const mapRef = useRef(null);
  const serviceMapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const freelancerUid = localStorage.getItem('freelancerUid');
        
        if (!token || !freelancerUid) {
          console.error('Missing token or freelancerUid in localStorage');
          return;
        }

        // Fetch freelancer profile data
        const profileResponse = await axios.get('http://localhost:5000/client/freelancer-profile-info', {
          headers: { Authorization: `Bearer ${token}` },
          params: { freelancerUid },
        });

        const profileData = profileResponse.data;
        setProfileData({
          ...profileData,
          profileImage: profileData.profileImage ? `http://localhost:5000/uploads/${profileData.profileImage}` : '',
          latitude: profileData.latitude || 0,
          longitude: profileData.longitude || 0,
        });

        // Fetch freelancer service data
        const serviceResponse = await axios.get('http://localhost:5000/client/freelancer-service-info', {
          headers: { Authorization: `Bearer ${token}` },
          params: { freelancerUid },
        });

        const serviceData = serviceResponse.data;
        if (serviceData.service) {
          setServiceData({
            ...serviceData.service,
            rating: serviceData.averageRating,
            noOfRating: serviceData.totalRatings,
          });
          setServiceError('');
        } else {
          setServiceError('No Service Data Found');
        }

        // Fetch freelancer past projects
        const projectsResponse = await axios.get('http://localhost:5000/client/freelancer-projects-info', {
          headers: { Authorization: `Bearer ${token}` },
          params: { freelancerUid },
        });

        const projectsData = projectsResponse.data;
        if (projectsData.length > 0) {
          setPastProjects(projectsData);
          setProjectsError('');
        } else {
          setPastProjects([]);
          setProjectsError('No Past Projects available');
        }
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setServiceError('Failed to fetch service data');
        setProjectsError('Failed to fetch past projects');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (profileData.latitude && profileData.longitude) {
      if (mapRef.current) {
        mapRef.current.remove(); // Clear existing map if any
      }
      mapRef.current = L.map('map').setView([profileData.latitude, profileData.longitude], 13);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
  
      L.marker([profileData.latitude, profileData.longitude]).addTo(mapRef.current)
        .bindPopup(`${profileData.fullName}'s Location`)
        .openPopup();
    }
  }, [profileData.latitude, profileData.longitude]);
  
  useEffect(() => {
    if (serviceData.latitude !== null && serviceData.longitude !== null) {
      if (serviceMapRef.current) {
        serviceMapRef.current.remove(); // Clear existing map if any
      }
      serviceMapRef.current = L.map('service-map').setView([serviceData.latitude, serviceData.longitude], 13);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(serviceMapRef.current);
  
      L.marker([serviceData.latitude, serviceData.longitude]).addTo(serviceMapRef.current)
        .bindPopup(`${serviceData.serviceName}'s Location`)
        .openPopup();
    }
  }, [serviceData.latitude, serviceData.longitude]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderProfileImage = () => {
    if (profileData.profileImage) {
      return <Avatar alt="Profile" src={profileData.profileImage} sx={{ width: 150, height: 150, border: '5px solid #283f76', boxShadow: 3 }} />;
    } else {
      const initials = profileData.fullName.split(' ').map(name => name[0]).join('');
      return <Avatar sx={{ width: 150, height: 150, bgcolor: '#283f76', color: '#fff', fontSize: 24 }}>{initials}</Avatar>;
    }
  };

  return (
    <>
      <Navbarclient />
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        <Paper elevation={4} sx={{ padding: 3, borderRadius: 3, backgroundColor: '#fafafa' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} md={3} display="flex" flexDirection="column" alignItems="center">
              {renderProfileImage()}
              <Typography variant="h5" align="center" mt={2} color="#283f76" fontSize={24} fontWeight="bold">
                {profileData.fullName}

                {profileData.isVerified && (
        <span className="verified-tick">&#x2714;</span> // Blue tick symbol
      )}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={8} md={9} sx={{ borderLeft: '3px solid #283f76', pl: 2 }}>
              <Box>
                <Typography variant="body1" fontSize={18} display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: '#283f76' }} /> {profileData.email}
                </Typography>
                <Typography variant="body1" fontSize={18} display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: '#283f76' }} /> {profileData.phoneNo}
                </Typography>
                <Typography variant="body1" fontSize={18} display="flex" alignItems="center">
                  <LocationOnIcon sx={{ mr: 1, color: '#283f76' }} /> {profileData.location}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" fontSize={24} fontWeight="bold" color="#283f76" sx={{ mb: 2 }}>
                Service <span className='highlight'>Provided</span>
              </Typography>
              <Box sx={{ borderTop: '1px solid #ccc', pt: 2 }}>
                {serviceError ? (
                  <Typography variant="body1" fontSize={16} color="error">
                    {serviceError}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Service Name:</strong> {serviceData.serviceName}
                    </Typography>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Service Type:</strong> {serviceData.serviceType}
                    </Typography>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Description:</strong> {serviceData.description}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center">
                      <MonetizationOnIcon sx={{ mr: 1, color: '#283f76' }} /> {serviceData.rate}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center">
                      <StarIcon sx={{ mr: 1, color: '#ffb400' }} /> {serviceData.rating}
                    </Typography>
                    <Typography variant="body1" fontSize={16}>
                      <strong>Number of Ratings:</strong> {serviceData.noOfRating}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" fontSize={24} fontWeight="bold" color="#283f76" sx={{ mb: 2 }}>
                Past <span className='highlight'>Projects</span>
              </Typography>
              {projectsError ? (
                <Typography variant="body1" fontSize={16} color="error">
                  {projectsError}
                </Typography>
              ) : (
                pastProjects.map((project) => (
                  <Paper key={project.id} elevation={3} sx={{ padding: 2, mb: 2, backgroundColor: '#f9f9f9', border: '1px solid #3f2fd', borderRadius: 2 }}>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Job Title:</strong> {project.jobTitle}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <EventIcon sx={{ mr: 1, color: '#283f76' }} /> {project.date}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <AccessTimeIcon sx={{ mr: 1, color: '#283f76' }} /> {project.time}
                    </Typography>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Review:</strong> {project.Reviews.length > 0 ? project.Reviews[0].comment : 'No reviews yet'}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center">
                      <StarIcon sx={{ mr: 1, color: '#ffb400' }} /> {project.Reviews.length > 0 ? project.Reviews[0].rating : 'N/A'}
                    </Typography>
                  </Paper>
                ))
              )}
            </Grid>

            <Grid item xs={12} mt={3}>
  <Typography variant="h6" fontSize={24} fontWeight="bold" color="#283f76" sx={{ mb: 2 }}>
    Map <span className='highlight'>Location</span> <br />
    <Box sx={{ borderTop: '1px solid #ccc', pt: 2 }}>
      {serviceData.latitude === null || serviceData.longitude === null ? (
        <Typography variant="body1" fontSize={16}>
          No map location provided
        </Typography>
      ) : (
        <div id="service-map" style={{ height: '400px', width: '100%', borderRadius: '8px', boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)' }}></div>
      )}
    </Box>
  </Typography>
</Grid>
          </Grid>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default FreelancerProfile;
