import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../component/SideBar';
import TopSearchBar from '../component/TopSearchBar';
import Header from '../component/Header';
import './../css/pageCss/AdminVerifyUser.css';
import nirmalhamal from '../images/nirmalhamal.jpg';
import ritakhadka from '../images/ritakhadka.jpg';

// Sample image placeholder for initials
const getInitialsImage = (name) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return `https://via.placeholder.com/150?text=${initials}`;
};

const AdminVerifyUser = () => {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [declineInfo, setDeclineInfo] = useState({ userId: null, reason: '' });
  const [verifiedCount, setVerifiedCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token and redirect if not present
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return; // Prevent further execution if token is missing
    }

    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/admin/verification-docs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        // Process and set state
        const processedData = data.map(user => ({
          id: user.uid,
          name: user.fullName,
          profile: user.profileImage
            ? `http://localhost:5000/uploads/${user.profileImage}`
            : getInitialsImage(user.fullName),
          mail: user.email,
          documents: {
            nid: user.identityDoc
              ? `http://localhost:5000/documents/${user.identityDoc}`
              : null,
            trainingCertificates: [
              user.workDoc1
                ? `http://localhost:5000/documents/${user.workDoc1}`
                : null,
              user.workDoc2
                ? `http://localhost:5000/documents/${user.workDoc2}`
                : null
            ].filter(doc => doc !== null)
          }
        }));

        setRequests(processedData);
      } catch (error) {
        console.error('Error fetching verification documents:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAccept = async (userId) => {
    const userToAccept = requests.find(user => user.id === userId);
    if (!userToAccept) return;

    // Immediately update the UI to make the accepted request invisible
    setRequests(prevRequests => prevRequests.filter(user => user.id !== userId));
    setBookings(prevBookings => [...prevBookings, userToAccept]);
    setVerifiedCount(prevCount => prevCount + 1);

    const token = localStorage.getItem('token');
    const { id, name, mail } = userToAccept;

    try {
      console.log(`User ${userId} accepted`);
      const response = await fetch('http://localhost:5000/admin/accept-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: id,
          fullName: name,
          email: mail
        })
      });

      if (!response.ok) {
        // Handle the error appropriately
        console.error('Error accepting verification:', await response.text());
        // Optionally, you can show an error message to the user here
      }
    } catch (error) {
      console.error('Error accepting user:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  const handleDecline = (userId) => {
    setDeclineInfo({ userId, reason: '' });
  };

  const confirmDecline = async () => {
    const { userId, reason } = declineInfo;
    if (!reason) return;

    // Immediately update the UI to make the declined request invisible
    setRequests(prevRequests => prevRequests.filter(user => user.id !== userId));
    setDeclineInfo({ userId: null, reason: '' });

    const token = localStorage.getItem('token');
    const userToDecline = requests.find(user => user.id === userId);
    const { id, name, mail } = userToDecline;

    try {
      console.log(`User ${userId} declined with reason: ${reason}`);
      const response = await fetch('http://localhost:5000/admin/reject-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: id,
          fullName: name,
          email: mail,
          rejectionMessage: reason
        })
      });

      if (!response.ok) {
        // Handle the error appropriately
        console.error('Error rejecting verification:', await response.text());
        // Optionally, you can show an error message to the user here
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  const cancelDecline = () => {
    setDeclineInfo({ userId: null, reason: '' });
  };

  return (
    <>
      <SideBar />
      <TopSearchBar />
      <div className='admin-verify-user'>
        <main className="content">
          {/* <Header bookings={bookings} pagename={`Verified Users`} /> */}
          <div className="verification-requests">
            <h2>Verification Requests:</h2>
            {requests.map((user, index) => (
              <div key={user.id} className="verification-card">
                <img src={user.profile} alt={`${user.name}'s profile`} className="profile-pic" />
                <div className='divfornameanddocuments'>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p className='useremail'>{user.mail}</p>
                    <div>
                      <button onClick={() => handleAccept(user.id)} className="accept-button">Accept</button>
                      <button onClick={() => handleDecline(user.id)} className="decline-button">Decline</button>
                    </div>
                  </div>
                  <div className="documents">
                    <div className="document-section">
                      <h4>Identity Documents</h4>
                      {user.documents.nid && <a href={user.documents.nid} target="_blank" rel="noopener noreferrer">View CD/NID</a>}
                    </div>
                    <div className="document-section">
                      <h4>Training Certificates</h4>
                      {user.documents.trainingCertificates.map((doc, idx) => (
                        <a key={idx} href={doc} target="_blank" rel="noopener noreferrer">View Certificate {idx + 1}</a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='adminindex'>{index + 1}</div>
                {declineInfo.userId === user.id && (
                  <div className="decline-reason">
                    <textarea
                      placeholder="Enter the reason to decline"
                      value={declineInfo.reason}
                      onChange={(e) => setDeclineInfo(prev => ({ ...prev, reason: e.target.value }))}
                    />
                    <button onClick={confirmDecline} className="confirm-decline-button">Confirm Decline</button>
                    <button onClick={cancelDecline} className="cancel-decline-button">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminVerifyUser;
