import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {serverIP} from '../config.js';
import '../styles/Header.css';
import { useUser } from '../context/userContext.js';

import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUsers } from '../features/messages/usersSlice.js'
import { clearFriendRequests } from '../features/messages/friendRequestSlice.js'
import { setMessages, clearMessages } from '../features/messages/messagesSlice.js';

const Header = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { user } = useUser();
  
   // Handle user logout
   const handleLogout = async () => {

    dispatch(clearUsers())
    dispatch(clearMessages())
    // dispatch(clearFriendRequests())

    try {
      const userId = user.id;
      // Send a POST request with user ID and token
      const response = await axios.post(
        `${serverIP}/auth/logout/`, 
        {userId},
        {headers: {
          Authorization: `Bearer ${user.token}`,
        },}
      );

      // Check for a successful logout response
      if (response.status === 200) {
        // Clear cookies
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
    <header>
      <nav>
        <ul>
          {user ? (
            <div className='row_cont'>
             <li><Link to="/allUsers">
              {user.photo ? 
                <img src={serverIP + user.photo} alt={user.username} className="userPhotoRight" />
                :
                <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="userPhotoRight" /> 
              }
              </Link>
             </li>
              <li>
                <Link to="/findFriends">Find Friends</Link>
              </li>
              <li>
                <Link to="/allChats">All Chats</Link>
              </li>
              <li>
                <Link to="/createChat">Create Chat</Link>
              </li>
              {/* <li>
                <Link to="/logout">Log out</Link>
              </li> */}
              <li onClick={handleLogout}>
                Log out
              </li>
            </div>
          ) : (
            <div className='row_cont'>
            </div>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
