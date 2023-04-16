import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegisterForm.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    repassword: '',
    biography: ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:8000/api/register/', formData)
    .then(response => {
        console.log(response.data);
        toast.success('User created successfully');
      })
      .catch(error => {
        console.log(error.response.data);
        toast.error('User already exists');
      });
  };
  useEffect(() => {
    document.title = 'Register Page'; // Set the document title
  }, []);

  return (
    <div>
        <h1 className='big-heading'>Register Page</h1>

        <form onSubmit={handleSubmit}>
        <label>
            Username:
            <input type="text" name="username" onChange={handleInputChange} value={formData.username} />
        </label>
        <br />
        <label>
            Email:
            <input type="email" name="email" onChange={handleInputChange} value={formData.email} />
        </label>
        <br />
        <label>
            Password:
            <input type="password" name="password" onChange={handleInputChange} value={formData.password} />
        </label>
        <br />
        <label>
            Confirm Password:
            <input type="password" name="repassword" onChange={handleInputChange} value={formData.repassword} />
        </label>
        <br />
      
    <button type="submit">Register</button>
    <ToastContainer position="bottom-right" />
 
    </form>
    </div>
    
  );
  
  
  
  
  
  
}

export default Register;


/*

import React from 'react';
import Register from './Register';

function MyPage() {
  return (
    <div>
      <h1>Register</h1>
      <Register />
    </div>
  );
}

export default MyPage;
we can export the register component so that we can use it in other componenrts or pages.
we create another component called mypage that renders register component along with heading
*/