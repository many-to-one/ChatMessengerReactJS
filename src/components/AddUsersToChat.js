import React, { useEffect, useState } from 'react'
import {serverIP} from '../config.js';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/userContext.js';

const AddUsersToChat = ({chat_id, onConfirm, onClick}) => {

  // Access the state passed from the ConfirmationDialog
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const chat_id = searchParams.get('data');

  const [ users, setUsers ] = useState([])
  const [ _users, set_Users ] = useState([])
  const [ selected, setSelected ] = useState(false)
  // console.log('users', users)

  const users_ = useSelector((state) => state.users);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const data = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    axios.get(`${serverIP}/chatUsers/${chat_id}/`, data)
    .then((response) => {
      if(response.status === 200){
        console.log('chatUsers', response.data.chat)
        const chatUserIds = response.data.chat.map(user => user.id);
        const usersToAdd = users_.filter((user) => !chatUserIds.includes(user.id))
        console.log('usersToAdd', usersToAdd)
        setUsers(usersToAdd)
      }
    })
    .catch((error) => {
      navigate('/')
    })
  },[chat_id])
 
  const addUser = (id) => {
    console.log('id', id)
    if ( !_users.includes(id) ) {
      set_Users((users) => [...users, id])
      setSelected(true)
    } else {
      // If it's already in the array, remove it
      set_Users((users) => {
        const updatedUsers = users.filter((uid) => uid !== id);
        return updatedUsers;
      });
      setSelected(false)
    }
    console.log('addUser', _users)
  }

  return (
        <div className="add_users_items">
          {users.map((user) => (
            <div className={users.includes(user.id) ? "user-list-item-green" : "user-list-item"} key={user.id}>
            <div className="user-link">
              <div className="user-link-in">
                <div className='row_cont'>
                  {user.photo ? 
                    <img src={serverIP + user.photo} alt={user.username} className="user-photo" />
                    :
                    <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="user-photo" /> 
                  }
                </div>
                <div className='row_cont' onClick={() => addUser(user.id)}>
                  <strong>{user.username}</strong>
                </div>
              </div>
            </div>
          </div>
          ))}
        <button onClick={() => onConfirm(_users)}>Add</button>
      </div>

  )

}

export default AddUsersToChat
