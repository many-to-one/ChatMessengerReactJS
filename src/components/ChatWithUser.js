import React, { useEffect, useState } from 'react'
import { serverIP, wsIP } from '../config'
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages, addMessage, removeMessage, markMessagesAsRead } from '../features/messages/messagesSlice.js';
// import { setWritingStatus } from '../features/messages/writingSlice.js';

import { useUser } from '../context/userContext.js';

import moment from 'moment';

const ChatWithUser = ({ user_ }) => {

  const { user } = useUser();
  const dispatch = useDispatch();
  const write = useSelector((state) => state.writing)
  const allMessages = useSelector((state) => state.messages);
  const userLastMessages = allMessages.filter((message) => message.conversation_id === user_.conv);
  const lastMessage = userLastMessages[userLastMessages.length - 1];
  const receiverMessages = userLastMessages.filter((message) => message.user_id === user_.id)
  const myMessages = userLastMessages.filter((message) => message.user_id !== user_.id)
  const unreadMessages = receiverMessages.filter((message) => message.unread === true);
  const myUnreadMessages = myMessages.filter((message) => message.unread === true);

  const [writing, setWriting] = useState(false)


  useEffect(() => {
    const wsConv = new WebSocket(`${wsIP}/ws/conversation/${user_.conv}/?userId=${user_.id}`); //&token=${user.token}

    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    const writingFunc = async () => {
      setWriting(true)
      // dispatch(setWritingStatus(true));
      // console.log('//// +++++', write)
      await sleep(2000)
      setWriting(false)
      // dispatch(setWritingStatus(false));
      // console.log('////-----', write)
    }

    wsConv.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'received_message') {

          console.log('RECEIVED_NEW_MESSAGE', message)

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

        } if (message.type === 'on_page_response') {
          // console.log('////', write)
          writingFunc() 
          if ( user_.id !== lastMessage.user_id) {
            console.log('condition', user_.id , lastMessage.user_id)
            dispatch(markMessagesAsRead(myUnreadMessages))
          }
        } 
      }

      return () => {
        if (wsConv) {
          wsConv.close();
        } 
      };

  }, [])




  // let date = user_.last_mess.timestamp.slice(1, 11 )
  let date = lastMessage.timestamp.slice(0, 10 )

  if ( lastMessage.timestamp.slice(1, 11 ) === moment().format().slice(0, 10) ) {
    date = `${lastMessage.timestamp.slice(12, 17)}`
  } else if ( date === moment().subtract(1, 'days').format('YYYY-MM-DD') ){
    date = `yesterday`
  }


  return (
    <div className="user-list-item" key={user_.id}>
      <div className="user-link-in">

        <div className='row_cont'>
          <img src={serverIP + user_.photo} alt={user_.username} className="user-photo" /> 
          <div className='count_add'>
            <p>{unreadMessages.length}</p>
          </div>
        </div>

        <div className='column_cont'>
          <Link to="/conversation" state={user_} className="user-link">
            <div>
              <strong>{user_.username}</strong>

              { lastMessage !== undefined &&
                <div className='line_cont'>
                  <div>
                  {writing ? (
                    <p>writing...</p>
                  ) : (
                    lastMessage.unread ? (
                      <p> - {lastMessage.content.slice(0, 30) + '...'}</p>
                    ) : (
                      <p> + {lastMessage.content.slice(0, 30) + '...'}</p>
                    )
                  )}
                  </div>
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

