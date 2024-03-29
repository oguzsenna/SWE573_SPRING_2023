import "./StoryDetail.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScriptNext, Marker } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import CommentSection from "./CommentSection.js";
import mapStyle from './mapStyle.json';
import ReactQuill from "react-quill";


const containerStyle = {
  width: "100%",
  height: "400px",
};

function StoryDetail() {
  const [story, setStory] = useState(null);
  const { story_id } = useParams();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    axios
      .get(`http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/stories/details/${story_id}`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data) {
          setStory(response.data);
          setLikeCount(response.data.likes.length);
          setLiked(response.data.liked_by_user);
        } else {
          console.error("Invalid API response format");
        }
      })
      .catch((error) => console.error(error));
  }, [story_id]);

  if (!story) {
    return <div>Loading...</div>;
  }

  function StoryMarkers({ locations }) {
    const markers = locations.map((location, index) => (
      <Marker
        key={index}
        position={{
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude),
        }}
      />
    ));

    return <>{markers}</>;
  }

  async function toggleLike() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/like/${story_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const updatedStory = response.data;
        if (updatedStory.likes) {
          setLikeCount(updatedStory.likes.length);
          setLiked(updatedStory.likes.includes(/* Your user id */));
        } else {
          console.error(
            'Error toggling like: "likes" field is missing in the response data'
          );
        }
      } else {
        console.error("Error toggling like:", response.statusText);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  async function fetchComments() {
    try {
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/stories/${story_id}/comments/`
      );
      if (response.status === 200) {
        fetchComments(response.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  // Calculate the average latitude and longitude to find the center of the map
  const center = story.locations.reduce(
    (accumulator, location) => {
      accumulator.lat += parseFloat(location.latitude);
      accumulator.lng += parseFloat(location.longitude);
      return accumulator;
    },
    { lat: 0, lng: 0 }
  );

  center.lat /= story.locations.length;
  center.lng /= story.locations.length;

  return (
    <div>
      <Link to="/homepage">Go back</Link>
      <h2>{story.title}</h2>
      <p>
        {" "}
        <h3>Author:</h3> {story.author_username}
      </p>
      <h3>Content</h3>
      <ReactQuill
              value={story.content}
              readOnly={true}
              modules={{ toolbar: false }}
            />
      {story.story_tags.length > 0 && (
      <p>
        <h3>Story Tags:</h3>
        {story.story_tags.map((tag, index) => (
          <span key={index} className="tag-container">
            {tag}
          </span>
        ))}
      </p>
    )}
      <br />
      {story.date && <p>Date: {story.date}</p>}
      {story.season && <p>Season: {story.season}</p>}
      {story.start_year && <p>Start Year: {story.start_year}</p>}
      {story.end_year && <p>End Year: {story.end_year}</p>}
      {story.start_date && <p>Start Date: {story.start_date}</p>}
      {story.end_date && <p>End Date: {story.end_date}</p>}
      {story.locations.length > 0 && (
        <>
          <h3>Locations:</h3>
          <ul>
            {story.locations.map((location, index) => (
              <li key={index}>
                {location.name} ({location.latitude}, {location.longitude})
              </li>
            ))}
          </ul>
          <div style={containerStyle}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={10}
              options={{
                styles: mapStyle
              }}
            >
              <StoryMarkers locations={story.locations} />
            </GoogleMap>
          </div>
          <div className="like-container">
            <button className="like-button" onClick={toggleLike}>
              <i
                className={`fas ${liked ? "fa-heart" : "fa-heart-o"}`}
                aria-hidden="true"
              />
              {liked ? " Unlike" : " Like"}
            </button>
            <span className="like-count">
              {likeCount}{" "}
              {likeCount === 1 || likeCount === 0 ? "Like" : "Likes"}
            </span>
          </div>
        </>
      )}
      <CommentSection story_id={story_id} />
    
    </div>
  );
}

export default StoryDetail;
