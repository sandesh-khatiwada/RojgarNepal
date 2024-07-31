import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './../css/pageCss/FreelancerService.css';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';


const FreelancerService = () => {
  const [formData, setFormData] = useState({
    userId: localStorage.getItem('userId'),
    serviceName: '',
    serviceType: '',
    description: '',
    rate: '',
    location: '',
    coordinates: { lat: 27.7172, lng: 85.3240 }  //Default to Kathmandu
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData({ ...formData, coordinates: e.latlng });
        console.log('selected cordinates:',e.latlng);
      },
    });
    return formData.coordinates ? (
      <Marker position={formData.coordinates} />
    ) : null;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {

      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:5000/user/service', formData, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the Bearer token in the Authorization header
      'Content-Type': 'application/json', // Optionally include the content type if needed
    },
    });

      
      console.log('Form data submitted successfully', response.data);
      navigate('/freelancer'); // Redirect to success page upon successful form submission
    } catch (error) {
      setErrorMessage('Error submitting form data: ' + (error.response?.data?.message || error.message));
      console.error('Error submitting form data:', error.message);

    }
  };

  return (
    <>
    <Navbar/>
    <div className="services-container">
      <form onSubmit={handleSubmit} className="services-form">
        <h2>Add Your <span className="highlight">Service</span> </h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="form-group">
          <label htmlFor="serviceName">Service Name *</label>
          <input
            type="text"
            id="serviceName"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="serviceType">Service Type *</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >





            <option value="">Select Service Type</option>
            <option value="Eletrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Painter">Painter</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Dish Washer">Dish Washer</option>
            <option value="Laundry">Laundry</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Technician">Technician</option>
            <option value="Selroti Maker">Selroti Maker</option>
            <option value="Tuition Teacher">Tuition Teacher</option>
            <option value="Sweeper">Sweeper</option>
            <option value="Repair-man">Repair-man</option>
            <option value="Gardener">Gardener</option>
            <option value="Pandit">Pandit</option>
            <option value="Care Taker">Care Taker</option>


          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="rate">Rate *</label>
          <input
            type="text"
            id="rate"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        {/* <div className="map-container">
          <MapContainer center={[27.7172, 85.324]} zoom={13} onClick={handleMapClick}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {formData.latitude && formData.longitude && (
              <Marker position={[formData.latitude, formData.longitude]}>
                <Popup>Your location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div> */}



        <div className="map-container">

        <label htmlFor="coordinates">PIN your location on map</label>
          <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '500px', width: '50vw' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        </div>



        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default FreelancerService;