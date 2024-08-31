// src/component/BookingTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './../css/componentCss/BookingTable.css';

const BookingTable = ({ bookings = [] }) => {
  if (!Array.isArray(bookings)) {
    console.error('Bookings prop is not an array');
    return null;
  }

  return (
    <table className="booking-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Client Name</th>
          <th>Client Email</th>
          <th>Freelancer Name</th>
          <th>Freelancer Email</th>
          <th>Booked Date</th>
          <th>Project Title</th>
          <th>Project Status</th>
          <th>Payment Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.length === 0 ? (
          <tr>
            <td colSpan="9">No bookings available</td>
          </tr>
        ) : (
          bookings.map((booking) => (
            <tr key={booking.id}>
              <td><span className="small-screen">Booking ID: </span>{booking.bid}</td>
              <td><span className="small-screen"> Client Name: </span>{booking.clientName}</td>
              <td><span className="small-screen">Client Email: </span>{booking.clientEmail}</td>
              <td><span className="small-screen">Freelancer Name: </span>{booking.freelancerName}</td>
              <td><span className="small-screen">Freelancer Email: </span>{booking.freelancerEmail}</td>
              <td><span className="small-screen">Booking Date: </span>{booking.date}</td>
              <td><span className="small-screen">Project Title: </span>{booking.jobTitle}</td>
              <td><span className="small-screen">Project Status: </span>{booking.paymentStatus=="Done"?"Completed":"Active"}</td>
              <td><span className="small-screen">Payment Status: </span>{booking.paymentStatus}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

BookingTable.propTypes = {
  bookings: PropTypes.array.isRequired,
};

export default BookingTable;
