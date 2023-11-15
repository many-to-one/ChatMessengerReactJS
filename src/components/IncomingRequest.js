import React from 'react'
import { serverIP } from '../config'

const IncomingRequest = ({ user, blockUser, denyRequest, confirmRequest }) => {
  return (
    <div className="user-list-item-request" key={user.id}>
      <div className="user-link-in">
        <div className='row_cont'>
          {user.photo ? 
            <img src={serverIP + user.photo} alt={user.username} className="user-photo" />
            :
            <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="user-photo" /> 
          }
        </div>
        <div className='addFriend'>
          <strong>{user.username}</strong>
          <button onClick={blockUser}>! </button>
          <button onClick={denyRequest}>- </button>
          <button onClick={confirmRequest}>Add </button>
        </div>
      </div>
    </div>
  )
}

export default IncomingRequest
