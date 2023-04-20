import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/stories/user',{
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
          {/* display other fields as needed */}
        </div>
      ))}
    </div>
  );
}

export default ProfilePage;
