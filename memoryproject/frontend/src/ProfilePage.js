import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './user-details-profile.css';
import { Link } from 'react-router-dom';


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
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
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
          setProfilePhotoPreview(response.data.profile_photo);
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

  const handleProfilePhotoChange = event => {
    setProfilePhotoFile(event.target.files[0]);
    setProfilePhotoPreview(URL.createObjectURL(event.target.files[0]));
  };

  const handleProfilePhotoAdd = async () => {
    const formData = new FormData();
    formData.append('profile_photo', profilePhotoFile);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/profile/photo', formData, { // Update the method and URL here
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUserDetails(response.data);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfilePhotoEdit = async () => {
    const formData = new FormData();
    formData.append('profile_photo', profilePhotoFile);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8000/api/profile/photo', formData, { // Update the method and URL here
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUserDetails(response.data);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfilePhotoDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete('http://localhost:8000/api/profile/photo', { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUserDetails(response.data);
      setProfilePhotoPreview(null);
    } catch (error) {
      console.error(error);
    }
  };
    
    if (!user || !userDetails) {
    return <div>Loading...</div>;

    }
    
    return (
    <div>
    <div className="user-details">
      <div className="profile-photo-section">
      {profilePhotoPreview && <img src={profilePhotoPreview} alt="Profile photo" />}
      <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
      
      </div>
      <div>
      {profilePhotoFile &&
        <>
          <button onClick={handleProfilePhotoAdd}>Add Profile Photo</button>
          <button onClick={() => setProfilePhotoFile(null)}>Cancel</button>
        </>
      }
      {profilePhotoPreview && !profilePhotoFile &&
        <>
          <button onClick={() => setProfilePhotoFile(profilePhotoFile => null)}>Edit Profile Photo</button>
          <button onClick={handleProfilePhotoDelete}>Delete Profile Photo</button>
        </>
      }
      </div>
         

    <div>
      <div className="biography-section">
        <h3>Username</h3>
        <p>{userDetails.username}</p>
      </div>

    <div className="biography-section">
        <h3>Email</h3>
        <p>{userDetails.email}</p>
      </div>

      <div className="biography-section">
        <h3>Biography</h3>
        <p>{userDetails.biography}</p>
      </div>
    
    </div>

  </div>

  <h1 className="user-stories-heading">User Stories</h1> 
  {stories.map(story => (
  <div key={story.id}>
    <h2>
      <Link to={`/stories/details/${story.id}`}>{story.title}</Link>
    </h2>
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
