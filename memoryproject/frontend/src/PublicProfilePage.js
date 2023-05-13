import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./user-details-profile.css";

function PublicProfilePage() {
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [following, setFollowing] = useState(false);
  const { username } = useParams();
  const navigate = useNavigate();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  const fetchProfilePhoto = async (user) => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/profile/photo/${user.id}`,
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/${username}`
        );
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/stories/${username}`
        );
        setStories(response.data.stories);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    fetchStories();
    fetchProfilePhoto();
  }, [username]);

  useEffect(() => {
    fetchProfilePhoto(user);
  }, [user]);

  async function toggleFollow() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/user/follow/${user.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const message = response.data.message;
        setFollowing(message === "User unfollowed successfully.");
        window.alert(message);
        if (message === "User unfollowed successfully.") {
          navigate("/HomePage");
        }
      } else {
        console.error("Error toggling follow:", response.statusText);
      }
    } catch (error) {
      console.error(
        "Error toggling follow:",
        error.response ? error.response.data : error
      );
    }
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.username}</h1>
      {profilePhotoUrl && (
        <img
          src={profilePhotoUrl}
          alt="Profile photo"
          className="profile-photo"
        />
      )}
      <div className="biography-section">
        <h2>Biography</h2>
        <p>{user.biography}</p>
      </div>

      <button onClick={toggleFollow}>
        {following ? "Unfollow" : "Follow"}
      </button>

      {stories.map((story) => (
        <h2 key={story.id}>
          <Link to={`/stories/details/${story.id}`}>{story.title}</Link>
        </h2>
      ))}
    </div>
  );
}

export default PublicProfilePage;
