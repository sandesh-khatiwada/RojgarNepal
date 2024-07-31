import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const ClientProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const profileResponse = await axios.get('http://localhost:5000/freelancer/client-profile-info', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            clientUid: localStorage.getItem('clientUid')
          }
        });
        setProfileData(profileResponse.data);

        // Fetch job posts
        const jobPostsResponse = await axios.get('http://localhost:5000/freelancer/client-profile-jobposts', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            clientUid: localStorage.getItem('clientUid')
          }
        });
        setJobPosts(jobPostsResponse.data);
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Helper function to get initials
  const getInitials = (fullName) => {
    const names = fullName.split(' ');
    const initials = names.map(name => name[0]).join('');
    return initials.toUpperCase();
  };

  const profileImageUrl = profileData?.profileImage ? `http://localhost:5000/uploads/${profileData.profileImage}` : null;

  return (
    <>
      <Navbarclient />
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        <Paper elevation={4} sx={{ padding: 3, borderRadius: 3, backgroundColor: '#fafafa' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} md={3} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                alt="Profile"
                src={profileImageUrl || undefined}
                sx={{ width: 150, height: 150, border: '5px solid #283f76', boxShadow: 3, fontSize: 48, backgroundColor: '#283f76', color: '#fff' }}
              >
                {!profileImageUrl && profileData?.fullName && getInitials(profileData.fullName)}
              </Avatar>
              <Typography variant="h5" align="center" mt={2} color="#283f76" fontSize={24} fontWeight="bold">
                {profileData?.fullName}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={8} md={9} sx={{ borderLeft: '3px solid #283f76', pl: 2 }}>
              <Box>
                <Typography variant="body1" fontSize={18} display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: '#283f76' }} /> {profileData?.email}
                </Typography>
                <Typography variant="body1" fontSize={18} display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: '#283f76' }} /> {profileData?.phoneNo}
                </Typography>
                <Typography variant="body1" fontSize={18} display="flex" alignItems="center">
                  <LocationOnIcon sx={{ mr: 1, color: '#283f76' }} /> {profileData?.location}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} mt={3}>
              <Typography variant="h6" fontSize={24} fontWeight="bold" color="#283f76" sx={{ mb: 2 }}>
                Job <span className='highlight'>Posts</span>
              </Typography>
              {jobPosts.length > 0 ? (
                jobPosts.map((job) => (
                  <Paper key={job.jpid} elevation={2} sx={{ padding: 2, mb: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Job Title:</strong> {job.jobTitle}
                    </Typography>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Description:</strong> {job.description}
                    </Typography>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Service Type:</strong> {job.serviceType}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <LocationOnIcon sx={{ mr: 1, color: '#283f76' }} /> {job.location}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <EventIcon sx={{ mr: 1, color: '#283f76' }} /> {job.date}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <AccessTimeIcon sx={{ mr: 1, color: '#283f76' }} /> {job.time}
                    </Typography>
                    <Typography variant="body1" fontSize={16} sx={{ mb: 1 }}>
                      <strong>Duration:</strong> {job.duration}
                    </Typography>
                    <Typography variant="body1" fontSize={16} display="flex" alignItems="center">
                      <MonetizationOnIcon sx={{ mr: 1, color: '#283f76' }} /> {job.proposedPayAmount}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body1" fontSize={18} color="#283f76">
                  No Current Job Postings
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container> <br /><br />
      <Footer />
    </>
  );
};

export default ClientProfile;
