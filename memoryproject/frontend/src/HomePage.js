import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

function HomePage() {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const perPage = 5;

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/stories/author', {
        params: { page, perPage },
        withCredentials: true,
      })
      .then(response => {
        console.log('API response:', response.data); // Log the response data
        if (response.data && response.data.stories && response.data.totalPages) {
          console.log('Received stories:', response.data.stories);
          setStories(response.data.stories);
          setTotalPages(response.data.totalPages);
        } else {
          console.error('Invalid API response format');
        }
      })
      .catch(error => console.error(error));
  }, [page]);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  return (
    <div>
      {stories.map(story => (
        <div key={story.id}>
          <h2>
            <Link to={`/stories/details/${story.id}`}>{story.title}</Link> {/* Update this line */}
          </h2>
          <p>Author: {story.author}</p>
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

export default HomePage;







