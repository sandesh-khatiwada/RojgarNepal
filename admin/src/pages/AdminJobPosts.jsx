import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../component/SideBar';
import TopSearchBar from '../component/TopSearchBar';
import AllJobPosts from '../component/AllJobPosts.jsx';

import './../css/pageCss/AdminDashboard.css';
import './../css/pageCss/AdminJobPosts.css';

const AdminJobPosts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="admin-job-posts">
      <SideBar/>
      <main className="content">
        <TopSearchBar />
        <AllJobPosts/>
      </main>
    </div>
  );
}

export default AdminJobPosts;
