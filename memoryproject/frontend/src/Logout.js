import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout');
      // successful logout, call the onLogout function
      if (onLogout) {
        onLogout();
      }
      // redirect to the home page
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;
