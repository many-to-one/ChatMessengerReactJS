import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { wsIP, serverIP } from '../config.js';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationDialog from './ConfirmationDialog.js';
import { useUser } from '../context/userContext.js';
import Cookies from 'js-cookie';

import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage, removeMessage } from '../features/messages/messagesSlice.js';

const Conversation = ( props ) => {

  // Reseived props:
  const location = useLocation()
  console.log('props', location.state)

  const receiver = location.state;
  console.log('receiver', receiver.conv)
  const conv_name = 1

  // User data from the useContext.js
  const { user } = useUser();

  const dispatch = useDispatch();
  const allMessages = useSelector((state) => state.messages);
  const messages = allMessages.filter((message) => message.conversation_id === receiver.conv);
  console.log('allMessages', allMessages)
  console.log('messages', messages)

  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState([])
  const [socket, setSocket] = useState([])
  // const [messages, setMessages_] = useState([])

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [dialog, setDialog] = useState(false)
  const [delQuestion, setDelQuestion] = useState(false)

  const navigate = useNavigate();
  // const to make a new message been on the bottom of the chat
  const chatContainerRef = useRef(null);

  const ws = new WebSocket(`${wsIP}/ws/conversation/${conv_name}/?userId=${user.id}&receiverId=${receiver.id}&token=${user.token}`);
  const wsu = new WebSocket(`${wsIP}/ws/AllUsers/${conv_name}/?userId=${user.id}&token=${user.token}`);

  // const messages = null

  // if (conversation) {
  //   messages = useSelector((state) => state.messages.filter((message) => message.conversation === conversation));
  // }

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


  useEffect(() => {

  //   // Fetch conversation data for the selected user based on userId.
  //   axios
  //   .post(
  //     `${serverIP}/conversations/`,
  //     {
  //       user: [parseInt(user.id), receiver.id],
  //     },
  //     { 
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     }
  //   )
  //   .then((response) => {
  //     const conversationData = response.data.conversation;
  //     setConversation(conversationData.id);

  //     // console.log('messages before axios', messages)

  //     // Check if messages for this conversation already exist in the state
  //     // setMessages_(allMessages.filter((message) => message.conversation === conversationData.id));
  //     // console.log('messages setMymessages', messages.filter((message) => message.user_id === receiver.id))

  //     console.log('conversation ID before', conversation, conversationData.id);
  //     // dispatch(setConvId(conversationData.id));
  //     // if (messages.length === 0 || Cookies.get('userId') !== conversationData.id) {
  //     //   console.log('conversation ID previouse', Cookies.get('userId'), conversationData.id);
  //     //   getConvMess(conversationData.id)
  //     // }
  //     console.log('conversationData', conversationData);
  //     // checkConversation(conversationData.id)

  //   })
  //   .catch((error) => {
  //     console.error('Error fetching conversation data:', error);
  //     if(error.response.status === 403){
  //       navigate('/login')
  //     }else if (error.response.status === 404){
  //       navigate('/404')
  //     }
  //   });


    // wsu.onmessage = (event) => {
    //   const dataU = JSON.parse(event.data);
    //   console.log('dataU', dataU);
    //   if (dataU.type === 'mess_count'){
    //     console.log('mess_count', dataU);
    //   }
    // }

    // message logic
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('message', message);
      if (message.type === 'message_deleted') {
        console.log('message_deleted', message.id);
        // Handle message deletion by filtering out the deleted message
        // setMessages((prevMessages) => {
        //   const updatedMessages = prevMessages.filter((msg) => msg.id !== message.id);
        //   console.log('updatedMessages', updatedMessages);
        //   return updatedMessages;
        // });
        dispatch(removeMessage(message.id));
      } else {
        console.log('received new message', message);
        setHasScrolled(false) // Get you to the bottom of the page if is incoming data from the server
        // setMessages((prevMessages) => [
        //   ...prevMessages, 
        //   { 
        //     id: message.id, 
        //     content: message.content, 
        //     username: message.username,
        //     unread: message.unread, 
        //     photo: message.photo
        //   }
        // ]);
        dispatch(addMessage({
          id: message.id,
          content: message.content,
          username: message.username,
          unread: message.unread,
          photo: message.photo,
          conversation_id: message.conversation_id,
        }));
      }
    }

    setSocket(ws);
    // setSocketU(wsu);

    return () => {
      if (ws) {
        ws.close();
      } 
    };

  }, []);


  // const checkConversation = (id) => {
  //   if (messages.length === 0 || conversation === id) {
  //     console.log('conversation ID previouse', conversation, id);
  //     getConvMess(id)
  //   }
  // }


//   const getConvMess = ((id) => {
//     console.log('getConvMess', id)
//     axios.get(`${serverIP}/getConversation/${id}/`,{

//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           userId: user.id,
//         },

//     })
//     .then((response) => {
//         console.log('getConvMess-response', response.data.messages)
//         // setMessages(response.data.messages)
//         // Use the setMessages action to store messages in the Redux store
//         // dispatch(setMessages(response.data.messages));
//     })
//     .catch((error) => {
//         console.error('Error fetching getConvMess data:', error);
//     })
// })

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (newMessage) {
        // dispatch(addMessage(newMessage));
        console.log('sendMessage', newMessage);
        console.log('sendMessage data', socket);
        socket.send(JSON.stringify({type: 'new_message', message: newMessage, id: receiver.conv }));
        // wsu.send(JSON.stringify({type: 'new_message_count', count: 1 }));
        setNewMessage('');
        // set up the sent message on the bottom
        window.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" })
      }
    }

    // if (socketU && socketU.readyState === WebSocket.OPEN) {
    //   console.log('socketU', 'ok');
    //   console.log('socketU data', socketU);
    //     socketU.send(JSON.stringify({type: 'new_message_count', count: 1 }));
    // }

  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
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
          <div className='conv_start'>
            <p onClick={() => getBack()}>@</p>
            { receiver.photo ?
              <img src={serverIP + receiver.photo} alt={receiver.username} className="user-photo" />
              :
              <img src={serverIP + 'media/profile_photos/default.png'} alt={receiver.username} className="user-photo" />
            }
          </div>
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
            <div className='name_del_row_cont'>
              <p>{receiver.username}</p>
              <button onClick={() => showDialog()}>...</button>
            </div>
          }
        </div>
      </div>

    <div className='chat-container-inner'>
      { dialog &&
        <div className='conv_header'>
          <div className='confirm_row_cont'>
            <button type="">Mute</button>
            <button type="">Multimedia</button>
            <button onClick={() => delQuest()}>Del</button>
            { delQuestion && 
              <button onClick={() => delUser(receiver.id)}>!</button>
            }
          </div>
        </div>
      }
      <div className='chat' ref={chatContainerRef}>

            {messages.map((message, index) => (
              <div key={index}>
                {message.username === user.username ?
                  <div className='message right'>
                    <div className='conf_dialog'>
                      {message.photo ? 
                        <img src={serverIP + message.photo} alt={message.username} className="userPhotoRight" />
                        :
                        <img src={serverIP + 'media/profile_photos/default.png'} alt={message.username} className="userPhotoRight" /> 
                      }
                      <p onClick={() => confirmDelete(message.id)}>{message.content}{' '}</p>
                    </div>
                    {message.unread ? 
                      <p className='unread'>-</p> 
                      :
                      <p className='unread'>+</p>
                    }
                  </div>
                :
                <div>
                  {message.resend ? 
                    <div className='message left'>
                      <div className='conf_dialog'>
                        {message.photo ? 
                          <img src={serverIP + message.photo} alt={message.username} className="userPhotoLeft" />
                          :
                          <img src={serverIP + 'media/profile_photos/default.png'} alt={message.username} className="userPhotoLeft" /> 
                        }
                        <p>{message.content}</p>
                      </div>
                      <p>'resend'</p>
                    </div>
                  :
                    <div className='message left'>
                      <div className='conf_dialog'>
                        {message.photo ? 
                          <img src={serverIP + message.photo} alt={message.username} className="userPhotoLeft" />
                          :
                          <img src={serverIP + 'media/profile_photos/default.png'} alt={message.username} className="userPhotoLeft" /> 
                        }
                        <p>{message.content}</p>
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
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  </div>

  );
};

export default Conversation;
