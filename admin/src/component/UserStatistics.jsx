import React from 'react';
import './../css/componentCss/UserStatistics.css';

const UserStatistics = ({ userStatistics = [] }) => {
  return (
    <div className="user-statistics">
      <table className="user-statistics-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {userStatistics.length > 0 ? (
            userStatistics.map((user) => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>
                  {user.profileImage ? (
                    <img 
                      src={`http://localhost:5000/uploads/${user.profileImage}`} 
                      alt={`${user.fullName}'s profile`} 
                      className="profile-image"
                    />
                  ) : (
                    <img 
                    src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                    alt={`${user.fullName}'s profile`} 
                    className="profile-image"
                  />
                  )}
                </td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNo}</td>
                <td className={user.isVerified ? 'status-verified' : 'status-unverified'}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No user data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserStatistics;
