import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [stories, setStories] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    // Make a GET request to the FollowerStoryView API
    axios.get('http://localhost:8000/api/follower-stories/25') // Replace 123 with the to_user_id you want to fetch stories for
      .then(response => {
        // Update the state with the fetched stories and pagination info
        setStories(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const handleNextPage = () => {
    // Make a GET request to the next page of the FollowerStoryView API
    axios.get(nextPage)
      .then(response => {
        // Update the state with the fetched stories and pagination info
        setStories(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handlePrevPage = () => {
    // Make a GET request to the previous page of the FollowerStoryView API
    axios.get(prevPage)
      .then(response => {
        // Update the state with the fetched stories and pagination info
        setStories(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <div>
      {stories.map(story => (
        <div key={story.id}>
          <h2>{story.title}</h2>
          <p>{story.content}</p>
        </div>
      ))}
      <button disabled={!prevPage} onClick={handlePrevPage}>Prev</button>
      <button disabled={!nextPage} onClick={handleNextPage}>Next</button>
    </div>
  );
}

export default HomePage;
