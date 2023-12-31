import React, { useEffect, useState } from 'react'
import { serverIP, wsIP } from '../config'
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../features/messages/messagesSlice.js';

import { useUser } from '../context/userContext.js';

import moment from 'moment';
import CryptoJS from "crypto-js";

const ResendUser = ({ user_, resendMess }) => {

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
  const [socket, setSocket] = useState([])

  const navigate = useNavigate();


  useEffect(() => {

    console.log('unreadMessages in ResendUser', receiverMessages)

    const wsConv = new WebSocket(`${wsIP}/ws/conversation/${user_.conv}/?userId=${user_.id}`); //&token=${user.token}

    wsConv.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('ON_MESSAGE', message)

        if (message.type === 'received_message') {

          console.log('RECEIVED_NEW_MESSAGE', message)

        } if (message.type === 'on_page_response') {
            console.log('on_page_response', message);
        } if (message.type === 'resend_message_') {
          console.log('resend_message_in_ResendUser', message);
          console.log('user_.conv_in_ResendUser', user_.conv);

          const key = '123'
          const decrypted = CryptoJS.AES.decrypt(message.content, key).toString(
            CryptoJS.enc.Utf8
          );

          dispatch(addMessage({
            id: message.id,
            content: decrypted,
            username: message.username,
            user_id: user.id,
            unread: true,
            resend: true,
            photo: user_.photo,
            conversation_id: user_.conv,
            timestamp: message.timestamp.slice(1,17),
          }));
          navigate('/AllUsers')
        }
      }

      setSocket(wsConv)

      return () => {
        if (wsConv) {
          wsConv.close();
        } 
      };

  }, [])

 


  let date = ''

  if ( lastMessage ) {
    // let date = user_.last_mess.timestamp.slice(1, 11 )
    date = lastMessage.timestamp.slice(0, 10 )

    if ( lastMessage.timestamp.slice(1, 11 ) === moment().format().slice(0, 10) ) {
      date = `${lastMessage.timestamp.slice(12, 17)}`
    } else if ( date === moment().subtract(1, 'days').format('YYYY-MM-DD') ){
      date = `yesterday`
    }

  }


  const resend = (user_) => {
    console.log('resend', user_.conv)
    socket.send(JSON.stringify({ type: 'resend_message', message: resendMess, id: user_.conv }));
    // navigate("/AllUsers")
  }

  return (
    <div className="user-list-item" key={user_.id} onClick={() => resend(user_)}>
      <div className="user-link-in">

        <div className='row_cont'>
          <img src={serverIP + user_.photo} alt={user_.username} className="user-all-photo" /> 
          <div className='count_add'>
            <p>{unreadMessages.length}</p>
          </div>
        </div>

        <div className='column_cont'>
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
        </div>
      </div>
    </div>
  )

  return (
    <div>ResendUser</div>
  )
}

export default ResendUser