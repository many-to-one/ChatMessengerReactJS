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
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import Peer from 'simple-peer';

import ConfirmationDialog from './ConfirmationDialog.js';
import { useUser } from '../context/userContext.js';
import { wsIP, serverIP } from '../config.js';

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
import AcceptCall from './video/AcceptCall.js';
import { getSpaceUntilMaxLength } from '@testing-library/user-event/dist/utils/index.js';

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
  const [socketAll, setSocketAll] = useState([])

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [dialog, setDialog] = useState(false)
  const [delQuestion, setDelQuestion] = useState(false)

  const [writing, setWriting] = useState(false)
  const [active, setActive] = useState(false)
  const [letter, setLetter] = useState('')

  const navigate = useNavigate();

  // const to make a new message been on the bottom of the chat
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if(user.id === null) {
      navigate('/')
    }
  },[])

  const ws = new WebSocket(`${wsIP}/ws/conversation/${receiver.conv}/?userId=${user.id}`); 

  // Show the bottom message with open the chat;
  // chatContainerRef is a var of useRef;
  // current means the curren element(chat): '<div className='chat' ref={chatContainerRef}>';
  // scrollHeight is the element of the DOM that sets up the chat element to the bottom

  const [hasScrolled, setHasScrolled] = useState(false);
  
  useEffect(() => {
    if ( !hasScrolled ) {
      window.scrollTo({ top: chatContainerRef.current.scrollHeight})
    }
  }, [])


  const [stream, setStream] = useState(null);
  const [call, setCall] = useState({});
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {

    navigator.mediaDevices.getUserMedia({ video: true, audio: true})
    .then((currentStream) => {
      setStream(currentStream);
      myVideo.current.srcObject = currentStream;
    })
    .catch((error) => {
      console.log('currentStream error', error)
    })

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('stream', (currentStream) => {
      myVideo.current.srcObject = currentStream;
    });

    connectionRef.current = peer;

  },[active === true])



  const wsAll = new WebSocket(`${wsIP}/ws/AllUsers/${conv_name}/?userId=${user.id}&token=${user.token}`);

  useEffect(() => {
      
      setSocketAll(wsAll)

      wsAll.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'call_in_response') {
        // setActive(true)
        console.log('call_in_response', data)
        navigate('/AcceptCall', { state: receiver })
      }
    
      return () => {
        if (wsAll) {
          wsAll.close();
        }
      };

    } 

}, [user])




  useEffect(() => {

    ws.onopen = () => {
      ws.send(JSON.stringify({type: 'on_page', userId: user.id, receiverId: receiver.id, chatId: receiver.conv}))
      };

  },[ws, user.username])


  useEffect(() => {

    if (lastMessage) {
      if ( lastMessage.user_id === receiver.id ) {
        const messages = allMessages.filter((message) => message.conversation_id === receiver.conv);
        const receiverMessages_ = messages.filter((message) => message.user_id === receiver.id);     
      }
    }
    // message logic
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'typing_') {
        if (message.user_id === receiver.id) {
          setWriting(message.typing)
        }
      }

      if (message.type === 'message_deleted') {
        dispatch(removeMessage(message.id));
      } 
      
      if ( message.type === 'resend_message_' ) {

        const key = '123'
        const decrypted = CryptoJS.AES.decrypt(message.content, key).toString(
          CryptoJS.enc.Utf8
        );

        dispatch(addMessage({
          id: message.id,
          content: decrypted,
          username: message.username,
          user_id: receiver.id,
          unread: true,
          resend: true,
          photo: user.photo,
          conversation_id: receiver.conv,
          timestamp: message.timestamp.slice(1,17),
        }));
      } 
      
      if ( message.type === 'on_page_response' ){

        if ( message.userId === receiver.id ){

          // In this condition the messege will be read for the sender if he is in connversation
          // at the moment when the reseiver enter to the conversation
          const myMessages = messages.filter((message) => message.user_id === user.id);
          const unreadMessages = myMessages.filter((message) => message.unread === true)
          dispatch(markMessagesAsRead(unreadMessages))
        } 
      } 

      if ( message.type === 'received_message' ) {

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

        setHasScrolled(false) // Get you to the bottom of the page if is incoming data from the server

        // if (message.user_id !== user.id){
        //   if ("Notification" in window) {
        //     // Request permission for notifications
        //     Notification.requestPermission().then((permission) => {
        //       if (permission === "granted") {
        //         // Show a notification
        //         new Notification("New Message", {
        //           body: `New message from ${message.username}: ${message.content}`,
        //         });
        //       }
        //     });
        //   } else {
        //     // Handle the case where notifications are not supported
        //     console.log("Notifications not supported in this browser");
        //     // You can also provide a user-friendly message or fallback behavior
        //   }
        // }
        
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
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (newMessage) {
        const key = '123'
        const encryptedMess = CryptoJS.AES.encrypt(newMessage, key).toString()
        socket.send(JSON.stringify({type: 'new_message', message: encryptedMess, id: receiver.conv, receiverId: receiver.id, senderId: user.id }));
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
  };


  const hangleTyping = () => {

    // Notify the server that the user is typing
    if (socket && socket.readyState === WebSocket.OPEN) {
      // console.log('handleChange socket @@@@@@@', socket)
    socket.send(JSON.stringify({ type: 'typing', typing: true, user: user.id }));

    // Set a timeout to stop typing after a few seconds
    setTimeout(() => {
      socket.send(JSON.stringify({ type: 'typing', typing: false, user: user.id }));
    }, 2000);
  }

  }

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



  const getCall = () => {
    if (active) {
      setActive(false)
    } else {
      if (socketAll && socketAll.readyState === WebSocket.OPEN){
        socketAll.send(JSON.stringify({type: 'call_in', caller: user.id, receiver: receiver.conv}));
      }
    }
  }



  return (

    <div className='chat-container'> 

      <div className='conv_header'>
        <div className={`${showConfirmation ? ' confirm_row_cont' : 'conv_row_cont'}`}>

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
                { writing &&
                  <p>writing...</p>
                }
              </div>
              
              <TiEquals 
                size={40}
                onClick={() => showDialog()}
              />
            </div>
          }
        </div>
      </div>

      { dialog &&
        <div className={`conv_header_qwe ${active ? 'hidden' : ''}`}>
          <div className='confirm_row_cont'>
            <TiCameraOutline 
              size={30}
              onClick={() => getCall()}
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


      {stream && active && (
        <div className='videoConv'>
          <video ref={myVideo} autoPlay playsInline className='videoConv' controls></video>
          <div className='call_navbar'>
            <div className='confirm_row_cont'>
              <TiCameraOutline 
                size={30}
                onClick={() => getCall()}
              />
            </div>
          </div>
        </div>
      )}

      <div className={`chat ${active ? 'hidden' : ''}`} ref={chatContainerRef}>

            {messages.map((message, index) => (
              <div key={index}>
                {message.user_id === user.id ?
                  <div className='message right'>
                    <div className='conf_mess'>
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
                      <div className='conf_mess'>
                        {receiver.photo ? 
                          <img src={serverIP + receiver.photo} alt={message.username} className="userPhotoLeft" />
                          :
                          <img src={serverIP + '/media/profile_photos/profile.png'} alt={message.username} className="userPhotoLeft" /> 
                        }
                        <p>{message.content}</p>
                      </div> 
                        <div className='conv_row_cont'>
                          <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                          <p className='unread'>
                            <TiArrowBackOutline 
                              size={20}
                              color='#77037B'
                            />
                          </p>
                        </div>
                    </div>
                  :
                    <div className='message left'>
                      <div className='conf_mess'>
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
          onKeyDown={hangleTyping}
        />
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
