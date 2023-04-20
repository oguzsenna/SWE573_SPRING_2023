import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/stories/author', {
      withCredentials: true,  
    })
      .then(response => setStories(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      {stories.map(story => (
        <div key={story.id}>
          <h2>{story.title}</h2>
          <p>{story.content}</p>
          {/* display other fields as needed */}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
