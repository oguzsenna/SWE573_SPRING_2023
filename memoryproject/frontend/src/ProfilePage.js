import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Pagination({ pageCount, currentPage, onPageChange }) {
  const pages = [...Array(pageCount).keys()].map(i => i + 1);

  return (
    <div>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{ fontWeight: page === currentPage ? 'bold' : 'normal' }}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const perPage = 5;

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/stories/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          params: {
            expand: 'author',
            page,
            perPage,
          },
        });

        if (response.data && response.data.stories && response.data.totalPages) {
          setUser(response.data.stories[0].author);
          setStories(response.data.stories);
          setTotalPages(response.data.totalPages);
        } else {
          console.error('Invalid API response format');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStories();
  }, [page]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (response.data) {
          setUserDetails(response.data);
        }

      } catch (error) {
        console.error(error);
      }
    };
    fetchUserDetails();
  }, []);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  if (!user || !userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <h2>User Details</h2>
        <p>Username: {userDetails.username}</p>
        <p>Email: {userDetails.email}</p>
        <p>Biography: {userDetails.biography}</p>
      </div>
      {stories.map(story => (
        <div key={story.id}>
          <h2>{story.title}</h2>
          {/* display other fields as needed */}
        </div>
      ))}
      <Pagination
        pageCount={totalPages}
        currentPage={page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default ProfilePage;
