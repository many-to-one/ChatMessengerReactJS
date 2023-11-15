import React, { useState } from 'react'
import {serverIP} from '../config.js';

const AddUsersToChat = ({isOpen, userList, onConfirm}) => {
  const [ users, setUsers ] = useState([])
  const [ selected, setSelected ] = useState(false)
  // console.log('users', users)
 
  const addUser = (id) => {
    if ( !users.includes(id) ) {
      setUsers((users) => [...users, id])
      setSelected(true)
    } else {
      // If it's already in the array, remove it
      setUsers((users) => {
        const updatedUsers = users.filter((uid) => uid !== id);
        return updatedUsers;
      });
      setSelected(false)
    }
    console.log('addUser', users)
  }


  return (
    <div>
      { isOpen &&
        <div>
        <div className="user-list-items">
          {userList.map((user) => (
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
        </div>
        <button onClick={() => onConfirm(users)}>Add</button>
      </div>
      }
    </div>
  )
}

export default AddUsersToChat
