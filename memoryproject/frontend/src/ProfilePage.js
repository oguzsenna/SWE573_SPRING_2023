import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/stories/user', {
      withCredentials: true,
      params: {
        expand: 'author', // fetch user data along with stories
      },
    })
      .then(response => {
        setUser(response.data[0].author); // set the user state variable
        console.log(setUser)
        setStories(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

    
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
