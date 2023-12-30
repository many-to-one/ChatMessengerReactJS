import React, { useEffect, useState } from 'react'
import { serverIP, wsIP } from '../config'
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages, addMessage, removeMessage, markMessagesAsRead, unreadUserMessages } from '../features/messages/messagesSlice.js';

import { useUser } from '../context/userContext.js';

import moment from 'moment';
import CryptoJS from "crypto-js";

import { TiEyeOutline, TiLocationArrowOutline } from "react-icons/ti";

const ChatWithUser = ({ user_, resendMess }) => {

  const { user, setSsockTest } = useUser();
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
  const [messCount, setMessCount] = useState(unreadMessages.length)

  useEffect(() => {

    // console.log('userLastMessages in ChatWithUser', userLastMessages)
    console.log('lastMessage in ChatWithUser', lastMessage, unreadMessages, user_.conv)
    setMessCount(unreadMessages.length)

    const wsConv = new WebSocket(`${wsIP}/ws/conversation/${user_.conv}/?userId=${user_.id}`); 

    wsConv.onopen = () => {
      wsConv.send(JSON.stringify({type: 'on_chatUser', userId: user.id, receiverId: user_.id, chatId: user_.conv}))
      };

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

          const key = '123'
          const decrypted = CryptoJS.AES.decrypt(message.content, key).toString(
            CryptoJS.enc.Utf8
          );

          dispatch(addMessage({
            id: message.id,
            content: decrypted,
            username: message.username,
            user_id: message.user_id,
            unread: message.unread,
            photo: message.photo,
            conversation_id: message.conversation_id,
            timestamp: message.timestamp.slice(1,17),
          }));

          console.log('messCount', messCount)
          setMessCount(prevMessCount => prevMessCount + 1);

        } if (message.type === 'on_page_response') {
          console.log('users', user.id, user_.id, message.user_id)

          writingFunc() 
          
          if (lastMessage) {
            if ( lastMessage.user_id === user.id ) {
              console.log('lastMessage.user_id', lastMessage.user_id)
              dispatch(markMessagesAsRead(unreadMessages))
  
            }
          }
        
        } if (message.type === 'resend_message_') {

          console.log('resend_message_in_chatWith', message);

          const key = '123'
          const decrypted = CryptoJS.AES.decrypt(message.content, key).toString(
            CryptoJS.enc.Utf8
          );

          dispatch(addMessage({
            id: message.id,
            content: decrypted,
            username: message.username,
            user_id: message.user_id,
            unread: true,
            resend: true,
            photo: user_.photo,
            conversation_id: user_.conv,
            timestamp: message.timestamp.slice(1,17),
          }));
        } if (message.type === 'on_chatUser_response') {
          console.log('on_chatUser_response', message.receiverId, message.unreadMess)
          if ( message.receiverId !== user.id ){
            setMessCount(message.unreadMess)
          }
        }
      } 

      return () => {
        if (wsConv) {
          wsConv.close();
        } 
      };

  }, [])

 


  let date = ''

  if ( lastMessage ) {
    console.log('lastMessage.timestamp', lastMessage.timestamp)
    // let date = user_.last_mess.timestamp.slice(1, 11 )
    date = lastMessage.timestamp.slice(0, 10 )

    if ( lastMessage.timestamp.slice(0, 10 ) === moment().format().slice(0, 10) ) {
      date = `${lastMessage.timestamp.slice(11, 16)}`
    } else if ( date === moment().subtract(1, 'days').format('YYYY-MM-DD') ){
      date = `yesterday`
    }

  }


  return (
    <div className="user-list-item" key={user_.id}>
      <div className="user-link-in">

        <div className='row_cont'>
          <img src={serverIP + user_.photo} alt={user_.username} className="user-all-photo" /> 
          <div className='count_add'>
            <p>{messCount}</p>
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
                    lastMessage.user_id === user.id ? (
                      lastMessage.unread ? (
                        <p className='conv_row_cont'> 
                          <TiLocationArrowOutline size={20}/>
                          {lastMessage.content.slice(0, 30) + '...'}
                        </p>
                      ) : (
                        <p className='conv_row_cont'> 
                          <TiEyeOutline size={20}/>
                          {lastMessage.content.slice(0, 30) + '...'}
                        </p>
                      )
                    ):(
                      <p>{lastMessage.content.slice(0, 30) + '...'}</p>
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

