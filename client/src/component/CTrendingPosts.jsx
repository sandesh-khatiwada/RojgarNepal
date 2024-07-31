import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './../css/componentCss/CTrendingPosts.css';

const CTrendingPosts = () => {
  const postsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/client/recent-jobs', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setPosts(response.data.recentJobs);
          console.log(response.data.recentJobs);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

;
  


  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const visiblePosts = posts.slice(startIndex, startIndex + postsPerPage);

  const handleViewMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }


  const getTimeDifference = (postTime) => {
    // Get the current time
    const currentTime = new Date();
  
    // Provided time
    const providedTime = new Date(postTime);
  
    // Calculate the difference in milliseconds
    const timeDifference = currentTime - providedTime;
  
    // Convert milliseconds to minutes
    const minutesAgo = Math.floor(timeDifference / (1000 * 60));
  
    // Convert minutes to hours and minutes
    const hoursAgo = Math.floor(minutesAgo / 60);
    const remainingMinutes = minutesAgo % 60;
  
    // Construct the formatted time difference string
    let timeDifferenceString = '';
    if (hoursAgo > 0) {
      timeDifferenceString += `${hoursAgo} hours`;
    }
    if (remainingMinutes > 0) {
      timeDifferenceString += ` ${remainingMinutes} minutes`;
    }else{
      timeDifferenceString +=`${0} minutes`
    }
    timeDifferenceString += ' ago';

    console.log(timeDifferenceString);


  
    return timeDifferenceString;
  };
  

  return (
    <section className="trending-posts">
   
      <section className="trending-posts-border">
        <h2>Recent Posts :</h2>
        <p>Discover the most recent job posts made on the platform</p>
      </section>
      <br />
      <br />
      <div className="post-cards-container">
        {visiblePosts.map((post, index) => (
      
          <div key={index} className="post-card">
            <div className="post-card-header">
              <section className='title'>Title:</section>
              <h3 className="titlename">{post.jobTitle}</h3> 
              <section className='time-display'>
                <span className='clock'>🕓</span><br />
                <span className='time-description'>{getTimeDifference(post.createdAt)}</span>
              </section>
            </div>
            <br />
  
            <p className="post-description">

              <img className='profileImage'
            src={post.User.profileImageUrl}
            alt="Profile"
      
          />
              <br /><br />
              "{post.description}"
            </p>
            <br />
            <p className="post-meta-item">
              <span className='location'>Location:</span>
              <span className='location-value'> {post.location}</span>
              <br />
              <span className='posted-by'>Posted By:</span>
              <span className='posted-by-value'> {post.User.fullName}</span>
            </p>
          </div>
        ))}
        {currentPage > 1 && (
          <button className="view-previous-btn" onClick={handleViewPrevious} title="View Previous">⟵</button>
        )}
        {currentPage < totalPages && (
          <button className="view-more-btn" onClick={handleViewMore} title="View More"> ⟶</button>
        )}
      </div>
         
    </section>
  );
  
};

export default CTrendingPosts;
