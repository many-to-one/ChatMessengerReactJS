// Description:

// When the user (1 or 2) enter to the page, we send to the server the message with type: 'on_page'.
// And receive the information that the user with his id is on the page.
// Actually we will have only one id if there is no user_2 and all our sent messages will be unread.
// But when the user_2 will enter to the page, we update all unread messages to read;

// This is the code logic:

// The user_1 send the message with the sendMessage() function;

// In onmessage method (else) the user_1 received the response from server,
// where the message is unread by default. When we add this message to the reduxe store;

// If user_2 enter to the page, we will get 'on_page_response' again with his id
// We have the condition: if ( message.userId === receiver.id ) 
// '''in this case message is a response, not a literal message, so it is only a user.id, not message.userId''' 
// So if this condition is true we filtering all unread messages in reduxe store of user_1 and update them to read;


import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { wsIP, serverIP } from '../config.js';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationDialog from './ConfirmationDialog.js';
import { useUser } from '../context/userContext.js';

import { useDispatch, useSelector } from 'react-redux';
import { addMessage, removeMessage, markMessagesAsRead } from '../features/messages/messagesSlice.js';

import { 
  TiArrowLeft, 
  TiEquals, 
  TiDeleteOutline, 
  TiCameraOutline, 
  TiVolumeMute, 
  TiUserDeleteOutline, 
  TiEyeOutline, 
  TiLocationArrowOutline,
  TiArrowBackOutline, 
} 
from "react-icons/ti";

const Conversation = ( props ) => {

  // Reseived props:
  const location = useLocation()
  const receiver = location.state;
  const conv_name = 1

  // User data from the useContext.js
  const { user, ssock } = useUser();

  const dispatch = useDispatch();
  const allMessages = useSelector((state) => state.messages);
  const messages = allMessages.filter((message) => message.conversation_id === receiver.conv);
  const lastMessage = messages[messages.length - 1];

  const receiverMessages_ = messages.filter((message) => message.user_id === receiver.id);
  const unreadMessages_ = receiverMessages_.filter((message) => message.unread === true)

  const write = useSelector((state) => state.writing)

  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState([])
  const [socket, setSocket] = useState([])

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [dialog, setDialog] = useState(false)
  const [delQuestion, setDelQuestion] = useState(false)

  const [writing, setWriting] = useState('')
  const [active, setActive] = useState('')
  const [letter, setLetter] = useState('')

  const navigate = useNavigate();

  // const to make a new message been on the bottom of the chat
  const chatContainerRef = useRef(null);

  const ws = new WebSocket(`${wsIP}/ws/conversation/${receiver.conv}/?userId=${user.id}`); // &token=${user.token}&receiverId${receiver.id}

  // Show the bottom message with open the chat;
  // chatContainerRef is a var of useRef;
  // current means the curren element(chat): '<div className='chat' ref={chatContainerRef}>';
  // scrollHeight is the element of the DOM that sets up the chat element to the bottom

  const [hasScrolled, setHasScrolled] = useState(false);
  
  useEffect(() => {
    if ( !hasScrolled ) {
      window.scrollTo({ top: chatContainerRef.current.scrollHeight})
    }
    // console.log('window.scrollTo', chatContainerRef.current.scrollHeight)
  }, [])

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };



  useEffect(() => {

    // const ws = new WebSocket(`${wsIP}/ws/conversation/${receiver.conv}/?userId=${user.id}`);

    // console.log('receiverMessages_', receiverMessages_)
    console.log('unreadMessages_', unreadMessages_)
    // dispatch(markMessagesAsRead(unreadMessages_))

    ws.onopen = () => {
      ws.send(JSON.stringify({type: 'on_page', userId: user.id, receiverId: receiver.id, chatId: receiver.conv}))
      };

  },[ws, user.username])


  useEffect(() => {

    // const sleep = (milliseconds) => {
    //   return new Promise(resolve => setTimeout(resolve, milliseconds));
    // };

    // const writingFunc = async () => {
    //   setWriting(true)
    //   await sleep(1000)
    //   setWriting(false)
    // }

    const writingFunc = () => {
      // Set the state to true
      setWriting(true);
  
      // After 1 second, set the state back to false
      setTimeout(() => {
        setWriting(false);
      }, 2000);
    };

    // console.log('messages store', messages, receiver.conv);
    // console.log('ssock', ssock);

    if ( lastMessage.user_id === receiver.id ) {
      // console.log('inConv_@@@@@', lastMessage.user_id, receiver.id, receiver.conv )
      const messages = allMessages.filter((message) => message.conversation_id === receiver.conv);
      const receiverMessages_ = messages.filter((message) => message.user_id === receiver.id);
      const unreadMessages_ = receiverMessages_.filter((message) => message.unread === true)
      // console.log('receiverMessages_', receiverMessages_)
      // console.log('unreadMessages_', unreadMessages_)
      
    }
    // message logic
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'message_deleted') {
        // console.log('message_deleted', message.id);
        dispatch(removeMessage(message.id));
      } else if ( message.type === 'resend_message_' ) {
        console.log('resend_message_in_conv', message, user);
        dispatch(addMessage({
          id: message.id,
          content: message.content,
          username: message.username,
          user_id: receiver.id,
          unread: true,
          resend: true,
          photo: user.photo,
          conversation_id: receiver.conv,
          timestamp: message.timestamp,
        }));
      } if ( message.type === 'on_page_response' ){
        // writingFunc()
        console.log('on_page from server @@@@@@@',user.id, receiver.id, message.userId, message)
        console.log('lastMessage', lastMessage)
        // const myMessages = messages.filter((message) => message.user_id === user.id);
        //   const unreadMessages = myMessages.filter((message) => message.unread === true)
        //   dispatch(markMessagesAsRead(unreadMessages))
        // console.log('markMessagesAsRead @@@@@@@@@@@', message.userId, receiver.id)
        if ( message.userId === receiver.id ){
          console.log('message.userId === receiver.id @@@@@@@', message.userId, receiver.id)
          // if (write === true) {
          //   setWriting('writting...')
          // }

          // In this condition the messege will be read for the sender if he is in connversation
          // at the moment when the reseiver enter to the conversation
          const myMessages = messages.filter((message) => message.user_id === user.id);
          const unreadMessages = myMessages.filter((message) => message.unread === true)
          dispatch(markMessagesAsRead(unreadMessages))
          // console.log('piszę... @@@@@@@', message.userId, receiver.id) 

          // setLetter('active')
          // setActive('pisze...')
          // setWriting(false)
          // if (!letter) {
          //   setTimeout(() => {
          //     setWriting(true);
          //     console.log('piszę... @@@@@@@')
          //   }, 2000);
          // }
          // writingFunc()
        } 
      } 
      // if ( lastMessage.user_id === receiver.id ) {
      //   const receiverMessages_ = messages.filter((message) => message.user_id === receiver.id);
      //   const unreadMessages_ = receiverMessages_.filter((message) => message.unread === true)
      //   console.log('unreadMessages_', unreadMessages_)
      //   dispatch(markMessagesAsRead(unreadMessages_))
      // }
      if ( message.type === 'received_message' ) {
        // console.log('received new message', message);
        dispatch(addMessage({
          id: message.id,
          content: message.content,
          username: message.username,
          user_id: message.user_id,
          unread: message.unread,
          photo: message.photo,
          conversation_id: message.conversation_id,
          timestamp: message.timestamp.slice(1,17),
        }));
        console.log('message timestamp --- ', message.timestamp.slice(1,17))
        setHasScrolled(false) // Get you to the bottom of the page if is incoming data from the server
      }
    }

    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      } 
    };

  }, []);

  const sendMessage = () => {
    console.log('sendMessage ssock', socket);
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (newMessage) {
        console.log('sendMessage', newMessage, receiver.conv);
        socket.send(JSON.stringify({type: 'new_message', message: newMessage, id: receiver.conv, receiverId: receiver.id, senderId: user.id }));
        setNewMessage('');

        // Calculate the new scroll position with an offset of 20px
        const scrollPosition = chatContainerRef.current.scrollHeight + 50;

        // set up the sent message on the bottom
        window.scrollTo({ top: scrollPosition, behavior: "smooth" })
      }
    }

  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    console.log('writing...')
  };

  const deleteMess = (id) => {
    console.log('deleteMess', id)
    const message = {
      type: 'delete_message',
      message_id: id,
      user_id: user.id
    };
    if (socket && socket.readyState === WebSocket.OPEN){
      socket.send(JSON.stringify(message));
      setShowConfirmation(false);
    }
  }

  const confirmDelete = (id) => {
    console.log('confirmDelete', id)
    setConfirmationMessage(`Are you sure you want to delete this message?`);
    setMessageToDelete(id);
    if (showConfirmation) {
      setShowConfirmation(false)
      setHasScrolled(true) // you always be at the same place of the page after clicking on the message 
    } else {
      setShowConfirmation(true);
      setHasScrolled(true) // you always be at the same place of the page after clicking on the message 
    }
};

const getBack = () => {
  navigate('/allUsers')
}


const showDialog = () => {
  if ( dialog ) {
    setDialog(false)
    setDelQuestion(false)
  } else {
    setDialog(true)
  }
}


const delQuest = () => {
  if ( delQuestion ) {
    setDelQuestion(false)
  } else {
    setDelQuestion(true)
  }
}


  const delUser = (id) => {
    console.log('id', id)
    axios
    .post(
      `${serverIP}/delUser/`,
      {
        friend: receiver.id,
        user: user.id,
      },
      { 
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    )
    .then((response) => {
      console.log('delUser', response);
      if ( response.status === 200 ) {
        navigate('/allUsers')
      }
    })
    .catch((error) => {
      console.error('Error fetching conversation data:', error);
      if(error.response.status === 403){
        navigate('/login')
      }else if (error.response.status === 404){
        navigate('/404')
      }
    });
  }



  return (

    <div className='chat-container'> 

      <div className='conv_header'>
        <div className={`${showConfirmation ? ' confirm_row_cont' : 'conv_row_cont'}`}>
          {/* <div className='conv_start'>
            <p onClick={() => getBack()}>
              <TiArrowLeft 
                size={35}
              />
            </p>
            { receiver.photo ?
              <img src={serverIP + receiver.photo} alt={receiver.username} className="user-photo" />
              :
              <img src={serverIP + 'media/profile_photos/profile.png'} alt={receiver.username} className="user-photo" />
            }
          </div> */}
          {showConfirmation ?
            <ConfirmationDialog
              conversation={conversation}
              user={user}
              resendMess={messageToDelete}
              isOpen={showConfirmation}
              message={confirmationMessage}
              onConfirm={() => deleteMess(messageToDelete)}
            />
            :
            <div className='conv_row_cont'>
              <div className='conv_start'>
                <p onClick={() => getBack()}>
                  <TiArrowLeft 
                    size={35}
                  />
                </p>
                { receiver.photo ?
                  <img src={serverIP + receiver.photo} alt={receiver.username} className="user-photo" />
                  :
                  <img src={serverIP + 'media/profile_photos/profile.png'} alt={receiver.username} className="user-photo" />
                }
                <p>{receiver.username}</p>
              </div>
              
              <TiEquals 
                size={30}
                onClick={() => showDialog()}
              />
            </div>
          }
        </div>
      </div>

      { dialog &&
        <div className='conv_header'>
          <div className='confirm_row_cont'>
            <TiCameraOutline 
              size={30}
            />
            <TiVolumeMute 
              size={30}
            />
            <TiUserDeleteOutline 
              size={30}
              onClick={() => delQuest()}
            />
            { delQuestion && 
              <button onClick={() => delUser(receiver.id)}>!</button>
            }
            <TiDeleteOutline 
              size={30}
              onClick={() => showDialog()}
            />
          </div>
        </div>
      }
      <div className='chat' ref={chatContainerRef}>

            {messages.map((message, index) => (
              <div key={index}>
                {message.user_id === user.id ?
                  <div className='message right'>
                    <div className='conf_dialog'>
                      {user.photo ? 
                        <img src={serverIP + user.photo} alt={message.username} className="userPhotoRight" />
                        :
                        <img src={serverIP + '/media/profile_photos/profile.png'} alt={message.username} className="userPhotoRight" /> 
                      }
                      <p onClick={() => confirmDelete(message.id)}>{message.content}{' '}</p>
                    </div>
                    {message.unread ? 
                    <div className='conv_row_cont'>
                      <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                      <p className='unread'>
                        <TiLocationArrowOutline size={20}/>
                      </p> 
                    </div>
                      :
                      <div className='conv_row_cont'>
                        <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                        <p className='unread'>
                          <TiEyeOutline size={20}/>
                        </p>
                      </div>
                    }
                  </div>
                :
                <div>
                  {message.resend ? 
                    <div className='message left'>
                      <div className='conf_dialog'>
                        {receiver.photo ? 
                          <img src={serverIP + receiver.photo} alt={message.username} className="userPhotoLeft" />
                          :
                          <img src={serverIP + '/media/profile_photos/profile.png'} alt={message.username} className="userPhotoLeft" /> 
                        }
                        <p>{message.content}</p>
                        <div className='conv_row_cont'>
                          <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                          <TiArrowBackOutline 
                            size={20}
                            color='#77037B'
                          />
                        </div>
                      </div> 
                    </div>
                  :
                    <div className='message left'>
                      <div className='conf_dialog'>
                        {receiver.photo ? 
                          <img src={serverIP + receiver.photo} alt={message.username} className="userPhotoLeft" />
                          :
                          <img src={serverIP + '/media/profile_photos/profile.png'} alt={message.username} className="userPhotoLeft" /> 
                        }
                        <div>
                          <p>{message.content}</p>
                          <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
                }
              </div>
            ))}

        </div>

      <div className='send sendConv'>
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          placeholder="Type your message..."
        />
        {/* <button onClick={sendMessage}>Send</button> */}
        <TiLocationArrowOutline 
          onClick={sendMessage}
          size={30}
          color='#77037B'

        />
      </div>

  </div>

  );
};

export default Conversation;
