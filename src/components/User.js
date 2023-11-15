import React from 'react'
import { serverIP } from '../config'

const User = ({ user, onConfirm, outcomingRequest }) => {
  return (
    <div className="user-list-item" key={user.id}>
      <div className="user-link-in">
        <div className='row_cont'>
          {user.photo ? 
            <img src={serverIP + user.photo} alt={user.username} className="user-photo" />
            :
            <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="user-photo" /> 
          }
          { outcomingRequest ?
            null
            :
            <div className='count_add'>
              <p onClick={onConfirm}>+</p>
            </div>
          }
        </div>
        <div className='column_cont'>
          <strong>{user.username}</strong>
        </div>
      </div>
    </div>
  )
}

export default User
