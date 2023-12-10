import React, { useEffect } from 'react'
import { serverIP, wsIP } from '../config'
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages, addMessage, removeMessage } from '../features/messages/messagesSlice.js';

import { useUser } from '../context/userContext.js';

import moment from 'moment';

const ChatWithUser = ({ user_ }) => {

  const { user } = useUser();
  console.log('ChatWithUser - main user', user)
  console.log('ChatWithUser', user_.conv)
  const dispatch = useDispatch();
  const allMessages = useSelector((state) => state.messages);
  const userLastMessages = allMessages.filter((message) => message.conversation_id === user_.conv);
  const lastMessage = userLastMessages[userLastMessages.length - 1];
  const unreadMessages = allMessages.filter((message) => message.unread === true);



  useEffect(() => {
    const wsConv = new WebSocket(`${wsIP}/ws/conversation/${user_.conv}/?userId=${user_.id}`); //&token=${user.token}

    wsConv.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('MESSAGE', message)
        if (message.type === 'received_message') {

          console.log('RECEIVED_NEW_MESSAGE', message)

          // setLastMess(message)

          dispatch(addMessage({
            id: message.id,
            content: message.content,
            username: message.username,
            user_id: message.user_id,
            unread: message.unread,
            photo: message.photo,
            conversation_id: message.conversation_id,
            timestamp: message.timestamp,
          }));

        } else {
          console.log('ELSE @@@@@@')
        }
      }

      return () => {
        if (wsConv) {
          wsConv.close();
        } 
      };

  }, [])




  let date = user_.last_mess.timestamp.slice(1, 11 )
  console.log('lastMessage', lastMessage)
  console.log('USER +', user_)
  console.log('DATE', user_.last_mess.timestamp)
  console.log('DATE +', date)
  console.log('unreadMessages', unreadMessages)
  if ( user_.last_mess.timestamp.slice(1, 11 ) === moment().format().slice(0, 10) ) {
    date = `${lastMessage.timestamp.slice(12, 17)}`
  } else if ( user_.last_mess.timestamp === moment().subtract(1, 'days').format('YYYY-MM-DD') ){
    date = `yesterday`
  }


  return (
    <div className="user-list-item" key={user_.id}>
      <div className="user-link-in">

        <div className='row_cont'>
          <img src={serverIP + user_.photo} alt={user_.username} className="user-photo" /> 
          <div className='count_add'>
            <p>{user_.count}</p>
          </div>
        </div>

        <div className='column_cont'>
          <Link to="/conversation" state={user_} className="user-link">
            <div>
              <strong>{user_.username}</strong>

              { lastMessage !== undefined &&
                <div className='line_cont'>
                { lastMessage.user_id === user_.id ?
                  <div>
                    {lastMessage.unread ?
                        <p> - { lastMessage.content }</p>
                        :
                        <p> + { lastMessage.content }</p>
                      }
                  </div>
                  :
                  <div>
                    {user_.last_mess ?
                        <p>- {user_.last_mess.content}</p>
                        :
                        <p>+ {user_.last_mess.content}</p>
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

