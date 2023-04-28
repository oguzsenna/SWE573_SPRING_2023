import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate, navigate } from 'react-router-dom';
import './HomePage.css';



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
  const [searchQuery, setSearchQuery] = useState("");
  const perPage = 5;
  const navigate = useNavigate();


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
  const handleSearch = async () => {
    navigate(`/UserSearch/${searchQuery}`);
  };

  return (
    <div>
      <div>
      <br />
      <br />
      <input
        type="text"
        placeholder="Search usernames..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      </div>
      {stories.map(story => (
        <div key={story.id}>
          <h2>
            <Link to={`/stories/details/${story.id}`}>{story.title}</Link>
          </h2>
          <p>Author: <Link to={`/users/${story.author_username}`}>{story.author_username}</Link></p>
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
