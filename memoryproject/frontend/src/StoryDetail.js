import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function StoryDetail() {
  const [story, setStory] = useState(null);
  const { story_id } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/stories/details/${story_id}`, { withCredentials: true })
      .then(response => {
        if (response.data) {
          setStory(response.data);
        } else {
          console.error('Invalid API response format');
        }
      })
      .catch(error => console.error(error));
  }, [story_id]);

  if (!story) {
    return <div>Loading...</div>;
  }

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
        </>
      )}
    </div>
  );
}

export default StoryDetail;
