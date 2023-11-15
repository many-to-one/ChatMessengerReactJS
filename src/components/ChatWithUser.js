import React from 'react'
import { serverIP } from '../config'
import { Link } from 'react-router-dom';

const ChatWithUser = ({ user }) => {
  return (
    <div className="user-list-item" key={user.id}>
                  <div className="user-link-in">
                    <div className='row_cont'>
                      {user.photo ? 
                        <img src={serverIP + user.photo} alt={user.username} className="user-photo" />
                        :
                        <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="user-photo" /> 
                      }
                      <div className='count_add'>
                        <p>{user.count}</p>
                      </div>
                    </div>
                    <div className='column_cont'>
                    <Link to="/conversation" state={user} className="user-link">
                      <strong>{user.username}</strong>
                      <div className='line_cont'>
                          {user.last_mess.unread ?
                            <p>- {user.last_mess.content}</p>
                            :
                            <p>+ {user.last_mess.content}</p>
                          }
                        <div>
                          <p className='line_date'>{user.last_mess.timestamp}</p>
                        </div>
                      </div>
                      </Link>
                    </div>
                  </div>
              </div>
  )
}

export default ChatWithUser;

