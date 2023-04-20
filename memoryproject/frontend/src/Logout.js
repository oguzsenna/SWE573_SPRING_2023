import axios from 'axios';

function Logout() {
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout');
      // successful logout, redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;