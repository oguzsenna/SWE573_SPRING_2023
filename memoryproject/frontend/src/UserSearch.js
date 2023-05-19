import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./UserSearch.css";

function SearchUserResults({}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useParams();

  const navigate = useNavigate();

  const handleUserClick = async (id) => {
    navigate(`/users/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery) {
        return;
      }

      try {
        setLoading(true);
        const searchResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/search_user?search=${searchQuery}`,
          { withCredentials: true }
        );
        console.log("searchResponse:", searchResponse);
        setResults(searchResponse.data.users);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery]);

  return (
    <div>
      <h2>Search Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        results.map((user) => (
          <ul>
            <li>
              <div
                key={user.username}
                onClick={() => handleUserClick(user.username)}
              >
                <a className="username" href={`/users/${user.username}`}>
                  {user.username}
                </a>
              </div>
            </li>
          </ul>
        ))
      )}
    </div>
  );
}

export default SearchUserResults;
