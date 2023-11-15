import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {serverIP} from '../../config';
import {useUser} from '../../context/userContext.js'

const Logout = () => {

  const { user } = useUser();
  const navigate = useNavigate();
  const userId = user.id;
  // const myToken = 'd810b18f-7329-4d6f-ba1e-044ede6e5765de0598bb-5acd-4954-971c-b18d01acde106e5efbf3-94c8-4565-8e3a-32169fd76801'

  // Handle user logout
  const handleLogout = async () => {

    try {

      console.log('token', user.token)
      
      // Send a POST request with user ID and token
      const response = await axios.post(
        `${serverIP}/auth/testlogout/`, 
        {userId},
        {headers: {
          Authorization: user.token,
        },}
      );

      // Check for a successful logout response
      if (response.status === 200) {
        // Redirect to the login page or another page
        navigate('/login');
      } else {
        console.error('Logout request was not successful:', response);
      }
    } catch (error) {
      // Handle errors, e.g., display an error message
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <h2>Logout</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
