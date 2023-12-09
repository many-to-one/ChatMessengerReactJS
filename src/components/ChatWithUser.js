import React, { useEffect } from 'react'
import { serverIP } from '../config'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import moment from 'moment';

const ChatWithUser = ({ user }) => {

  const allMessages = useSelector((state) => state.messages);
  const userLastMessages = allMessages.filter((message) => message.conversation_id === user.conv);
  const lastMessage = userLastMessages[userLastMessages.length - 1];
  const unreadMessages = allMessages.filter((message) => message.unread === true);

  let date = user.last_mess.timestamp.slice(1, 11 )
  console.log('lastMessage', lastMessage)
  console.log('USER +', user)
  console.log('DATE', user.last_mess.timestamp)
  console.log('DATE +', date)
  console.log('unreadMessages', unreadMessages)
  if ( user.last_mess.timestamp.slice(1, 11 ) === moment().format().slice(0, 10) ) {
    date = `${lastMessage.timestamp.slice(12, 17)}`
  } else if ( user.last_mess.timestamp === moment().subtract(1, 'days').format('YYYY-MM-DD') ){
    date = `yesterday`
  }


  return (
    <div className="user-list-item" key={user.id}>
      <div className="user-link-in">

        <div className='row_cont'>
          <img src={serverIP + user.photo} alt={user.username} className="user-photo" /> 
          <div className='count_add'>
            <p>{user.count}</p>
          </div>
        </div>

        <div className='column_cont'>
          <Link to="/conversation" state={user} className="user-link">
            <div>
              <strong>{user.username}</strong>

              { lastMessage !== undefined &&
                <div className='line_cont'>
                { lastMessage.user_id === user.id ?
                  <div>
                    {lastMessage.unread ?
                        <p> - { lastMessage.content }</p>
                        :
                        <p> + { lastMessage.content }</p>
                      }
                  </div>
                  :
                  <div>
                    {user.last_mess ?
                        <p>- {user.last_mess.content}</p>
                        :
                        <p>+ {user.last_mess.content}</p>
                      }
                  </div>
                }

                <p className='line_date'>{date}</p>
              </div>
              }
                                                  
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ChatWithUser;

