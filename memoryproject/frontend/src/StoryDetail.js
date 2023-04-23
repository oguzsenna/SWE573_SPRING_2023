import './StoryDetail.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';



const containerStyle = {
  width: '100%',
  height: '400px'
};

function StoryDetail() {
  const [story, setStory] = useState(null);
  const { story_id } = useParams();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);



  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/stories/details/${story_id}`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data) {
          setStory(response.data);
          setLikeCount(response.data.likes.length);
          setLiked(response.data.liked_by_user);
        } else {
          console.error('Invalid API response format');
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:8000/api/like/${story_id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        const updatedStory = response.data;
        if (updatedStory.likes) {
          setLikeCount(updatedStory.likes.length);
          setLiked(updatedStory.likes.includes(/* Your user id */));
        } else {
          console.error('Error toggling like: "likes" field is missing in the response data');
        }
      } else {
        console.error('Error toggling like:', response.statusText);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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

      <h2>{story.title}</h2>
      <p>Author: {story.author}</p>
            
      {story.content && <p>Content: {story.content}</p>}
      {story.story_tags.length > 0 && <p>Story Tags: {story.story_tags.join(', ')}</p>}
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
            <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
              >
                <StoryMarkers locations={story.locations} />

              </GoogleMap>
            </LoadScriptNext>
          </div>
          <div className="like-container">
            <button className="like-button" onClick={toggleLike}>
              <i className={`fa ${liked ? 'fa-heart full-heart' : 'fa-heart-o'}`} aria-hidden="true" />
              {liked ? ' Unlike' : ' Like'}
            </button>
            <span className="like-count">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
          </div>
        </>
      )}
      <Link to="/homepage">Go back</Link> 

    </div>
  );
}

export default StoryDetail;
