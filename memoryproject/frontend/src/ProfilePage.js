import React, { useState, useEffect } from "react";
import axios from "axios";
import "./user-details-profile.css";
import { Link } from "react-router-dom";

function Pagination({ pageCount, currentPage, onPageChange }) {
  const pages = [...Array(pageCount).keys()].map((i) => i + 1);

  return (
    <div>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{ fontWeight: page === currentPage ? "bold" : "normal" }}
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
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userDetailsLoading, setUserDetailsLoading] = useState(true);
  const [editingBiography, setEditingBiography] = useState(false);
  const [newBiography, setNewBiography] = useState("");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/stories/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            params: {
              expand: "author",
              page,
              perPage,
            },
          }
        );

        if (
          response.data &&
          response.data.stories &&
          response.data.totalPages
        ) {
          setStories(response.data.stories);
          setTotalPages(response.data.totalPages);
        } else {
          console.error("Invalid API response format");
        }
        setUserLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStories();
  }, [page]);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/profile/photo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            responseType: "blob",
          }
        );
  
        const imageUrl = URL.createObjectURL(response.data);
        setProfilePhotoUrl(imageUrl);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProfilePhoto();
  }, [userDetails]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (response.data) {
          setUserDetails(response.data);
          setProfilePhotoPreview(response.data.profile_photo);
        } else {
          console.error("Invalid API response format");
        }
        setUserDetailsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserDetails();
  }, []);

  const updateProfilePhotoUrl = () => {
    if (profilePhotoFile) {
      setProfilePhotoUrl(URL.createObjectURL(profilePhotoFile));
    } else if (userDetails && userDetails.profile_photo) {
      setProfilePhotoUrl(userDetails.profile_photo);
    } else {
      setProfilePhotoUrl(null);
    }
  };

  const deleteStory = async (storyId) => {
    const userConfirmation = window.confirm(
      "Are you sure you want to delete this story?"
    );
    if (!userConfirmation) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/delete/stories/${storyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Show a success message
      window.alert("Story Deleted Successfully");

      // Remove the deleted story from the stories array
      const updatedStories = stories.filter((story) => story.id !== storyId);
      setStories(updatedStories);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleProfilePhotoChange = (event) => {
    setProfilePhotoFile(event.target.files[0]);
    setProfilePhotoPreview(URL.createObjectURL(event.target.files[0]));
  };

  const handleProfilePhotoAdd = async () => {
    const formData = new FormData();
    formData.append("profile_photo", profilePhotoFile);
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/profile/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
        updateProfilePhotoUrl();
      }
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleProfilePhotoDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/profile/photo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setProfilePhotoUrl(null);
      }
    } catch (error) {
      console.error(error);
    }
  };
  

  const editBiography = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/biography`,
        { biography: newBiography },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setUserDetails(response.data);
        setEditingBiography(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (userDetailsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="user-details">
        <div className="profile-photo-section">
          {profilePhotoUrl && <img src={profilePhotoUrl} alt="Profile photo" />}
        </div>
        <br />
        <br />
        {!profilePhotoFile && (
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
          />
        )}
        {profilePhotoFile && (
          <div className="profile-photo-section">
          <div className="profile-photo-preview">
            <h4>Profile Photo Preview:</h4>
            <img src={profilePhotoPreview} alt="Profile photo preview" />
          </div>
        </div>
        )}
        <div>
          {profilePhotoFile && (
            <>
              <button onClick={handleProfilePhotoAdd}>Add Profile Photo</button>
              <button onClick={() => setProfilePhotoFile(null)}>Cancel</button>
            </>
          )}
          {profilePhotoUrl && !profilePhotoFile && (
            <>
              <button onClick={handleProfilePhotoDelete}>
                Delete Profile Photo
              </button>
            </>
          )}
        </div>

        <div>
          <div>
            <h3>Username</h3>
            <p>{userDetails.username}</p>
          </div>

          <div>
            <h3>Email</h3>
            <p>{userDetails.email}</p>
          </div>
          <h3>Biography</h3>
          <div className="biography-section">
            {!editingBiography && <p>{userDetails.biography}</p>}
            {editingBiography && (
              <textarea
                value={newBiography}
                onChange={(e) => setNewBiography(e.target.value)}
                rows={5}
                cols={50}
              />
            )}
          </div>

          <div>
            {!editingBiography && (
              <button
                onClick={() => {
                  setEditingBiography(true);
                  setNewBiography(userDetails.biography || "");
                }}
              >
                Edit Biography
              </button>
            )}
            {editingBiography && (
              <>
                <button onClick={editBiography}>Save</button>
                <button onClick={() => setEditingBiography(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <h1 className="user-stories-heading">User Stories</h1>
      {stories.map((story) => (
        <div key={story.id}>
          <h2>
            <Link to={`/stories/details/${story.id}`}>{story.title}</Link>
          </h2>
          <button onClick={() => deleteStory(story.id)}>Delete</button>
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
