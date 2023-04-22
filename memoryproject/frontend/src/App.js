import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import './App.css';
import CreateStory from './CreateStory'
import Logout from './Logout';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import StoryDetail from './StoryDetail';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
            {!isLoggedIn && (
              <>
                <Link to="/" className="nav-item nav-link button">Entrance</Link>
                <Link to="/register" className="nav-item nav-link button">Register</Link>
                <Link to="/login" className="nav-item nav-link button">Login</Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <Link to="/homepage" className="nav-item nav-link button">Home Page</Link>
                <Link to="/profile_page" className="nav-item nav-link button">Profile Page</Link> 
                <Link to="/create_story" className="nav-item nav-link button">Create Story</Link>
                <Link to="/logout" className="nav-item nav-link button">Logout</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          

          {!isLoggedIn && (
            <>
              <Route index path="/" element={
              <div className="memories-container">
                <img src="https://static.vecteezy.com/system/resources/previews/004/264/987/original/the-best-memories-modern-calligraphy-inscription-wall-art-decor-design-wedding-photo-album-vector.jpg" alt="Memories" style={{ width: '1000px', height: 'auto'}} />
              </div>
            } />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            </>
          )}
          {isLoggedIn && (
            <>
              <Route path="/profile_page" element={<ProfilePage />} />
              <Route path="/create_story" element={<CreateStory />} />
              <Route path="/logout" element={<Logout onLogout={() => setIsLoggedIn(false)} />} />
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/stories/details/:story_id" element={<StoryDetail />} /> {/* Update this line */}

            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;