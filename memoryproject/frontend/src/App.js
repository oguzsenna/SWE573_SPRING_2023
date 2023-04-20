import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import './App.css';
import CreateStory from './CreateStory'
import Logout from './Logout';
import HomePage from './HomePage';

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
            <Link to="/" className="nav-item nav-link button">Home</Link>
            <Link to="/register" className="nav-item nav-link button">Register</Link>
            <Link to="/login" className="nav-item nav-link button">Login</Link>
            <Link to="/create_story" className="nav-item nav-link button">Create Story</Link>
            <Link to="/homepage" className="nav-item nav-link button">Home Page</Link> 
            <Link to="/logout" className="nav-item nav-link button">Logout</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
              <div className="memories-container">
                <img src="https://static.vecteezy.com/system/resources/previews/004/264/987/original/the-best-memories-modern-calligraphy-inscription-wall-art-decor-design-wedding-photo-album-vector.jpg" alt="Memories" style={{ width: '1000px', height: 'auto'}} />
              </div>
          } />          

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create_story" element={<CreateStory />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/homepage" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
