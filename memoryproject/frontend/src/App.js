import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Switch,
} from "react-router-dom";
import { LoadScriptNext, LoadScript } from "@react-google-maps/api";
import Register from "./Register";
import Login from "./Login";
import "./App.css";
import CreateStory from "./CreateStory";
import Logout from "./Logout";
import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";
import StoryDetail from "./StoryDetail";
import PublicProfilePage from "./PublicProfilePage";
import UserSearch from "./UserSearch";
import StorySearch from "./StorySearch";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/user`, {
        withCredentials: true,
      });
      if (response && response.data) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
            {!isLoggedIn && (
              <>
                <Link to="/" className="nav-item nav-link button">
                  Entrance
                </Link>
                <Link to="/register" className="nav-item nav-link button">
                  Register
                </Link>
                <Link to="/login" className="nav-item nav-link button">
                  Login
                </Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <Link to="/homepage" className="nav-item nav-link button">
                  Home Page
                </Link>
                <Link to="/profile_page" className="nav-item nav-link button">
                  Profile Page
                </Link>
                <Link to="/create_story" className="nav-item nav-link button">
                  Create Story
                </Link>
                <Link to="/StorySearch" className="nav-item nav-link button">
                  Search Stories
                </Link>
                <Link to="/logout" className="nav-item nav-link button">
                  Logout
                </Link>
              </>
            )}
          </div>
        </nav>
        <LoadScriptNext
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
          <Routes>
            {!isLoggedIn && (
              <>
                <Route
                  index
                  path="/"
                  element={
                    <div className="memories-container">
                      <img
                        src="https://i.imgur.com/EaGTMJa.png"
                        alt="Memories"
                        style={{
                          width: "1000px",
                          height: "auto",
                          //mixBlendMode: 'multiply',
                          //backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                  }
                />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/login"
                  element={<Login onLogin={() => setIsLoggedIn(true)} />}
                />
              </>
            )}
            {isLoggedIn && (
              <>
                <Route path="/profile_page" element={<ProfilePage />} />
                <Route path="/create_story" element={<CreateStory />} />
                <Route
                  path="/logout"
                  element={<Logout onLogout={() => setIsLoggedIn(false)} />}
                />
                <Route path="/homepage" element={<HomePage />} />
                <Route
                  path="/stories/details/:story_id"
                  element={<StoryDetail />}
                />
                <Route
                  path="/users/:username"
                  element={<PublicProfilePage />}
                />
                <Route
                  path="/UserSearch/:searchQuery"
                  element={<UserSearch />}
                />
                <Route path="/StorySearch" element={<StorySearch />} />
              </>
            )}
          </Routes>
        </LoadScriptNext>
      </div>
    </Router>
  );
}

export default App;
