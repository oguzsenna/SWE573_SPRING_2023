import React from 'react';
import axios from 'axios';

function Logout() {
  const handleLogoutClick = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/logout',{}, { withCredentials: true });
      console.log('Request Headers:', response.config.headers);
      console.log('Response Headers:', response.headers);
      if (response.data.message === 'success') {
        // Clear any user-related data from application 
        localStorage.removeItem('token');

        // Redirect to the landing or the login page after successful logout
        window.location.href = '/';
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <button onClick={handleLogoutClick}>
      Logout
    </button>
  );
}

export default Logout;