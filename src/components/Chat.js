import React, { useEffect, useRef, useState } from 'react';
import { w3cwebsocket as WebSocket } from 'websocket';
import axios from 'axios';
import {wsIP, serverIP} from '../config.js';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Chat.css';
import ConfirmationDialog from './ConfirmationDialog.js';
import { useUser } from '../context/userContext.js';
import AddUsersToChat from './AddUsersToChat.js';

import CryptoJS from "crypto-js";

import { useDispatch, useSelector } from 'react-redux';
import { addMessage, removeMessage } from '../features/messages/messagesSlice.js';

import { 
  TiArrowLeft, 
  TiEquals,
  TiLocationArrowOutline, 
} 
from "react-icons/ti";

const Chat = (props) => {

  const { user } = useUser();
  const navigate = useNavigate();

   // Reseived props:
   const location = useLocation()
   const chat = location.state 
   const chatID = chat.id

  const dispatch = useDispatch();
  const allChatMessages = useSelector((state) => state.messages);
  const messages = allChatMessages.filter((message) => message.chat_id === chat.id);
  const users = useSelector((state) => state.users);
  const chatUsers = useSelector((state) => state.chatUsers);
  const chatUs = users.filter((user) => chat.user.includes(user.id));
  console.log('chatUs', chatUs)
  const chatChat = users.filter((user) => user.id === chat.user)

  const [data, setData] = useState(null)
  const [usersPhotos, setUsersPhotos] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState([]);
  const [userDelQuest, setUserDelQuest] = useState(false);
  const [dialog, setDialog] = useState(false)
  const [showAddUsers, setShowAddUsers] = useState(false)
  const [creater, setCreater] = useState();

  const [chatUsers_, setChatUsers_] = useState([]);

  // const to make a new message been on the bottom of the chat
  const chatContainerRef = useRef(null);

  const nav = useNavigate()



  //  ################################################################################################### //

  // Show the bottom message with open the chat;
  // chatContainerRef is a var of useRef;
  // current means the curren element(chat): '<div className='chat' ref={chatContainerRef}>';
  // scrollHeight is the element of the DOM that sets up the chat element to the bottom

  //  ################################################################################################### //

  useEffect(() => {
    window.scrollTo({ top: chatContainerRef.current.scrollHeight}) 
  })


  //  ################################################################################################### //
  //  ##################################### CONNECT TO THE SOCKET ####################################### //
  //  ################################################################################################### //

  const ws = new WebSocket(`${wsIP}/ws/chat/${chatID}/?userId=${user.id}&token=${user.token}`);

  useEffect(() => {

    const data = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    axios.get(`${serverIP}/chatUsers/${chatID}/`, data)
    .then((response) => {
      setChatUsers_(response.data.chat)
      setCreater(response.data.creater)
    })
    .catch((error) => {
      console.log('chatUsers axios error', error)
    })
  },[])
  
  useEffect(() => {

    // Receive data from server via socket
    ws.onmessage = (event) => {

      const message = JSON.parse(event.data);

      if (message.type === 'message_deleted') {
        dispatch(removeMessage(message.id));
        // Handle message deletion by filtering out the deleted message
      } else if (message.type === 'added_message') {

        const key = '123'
        const decrypted = CryptoJS.AES.decrypt(message.message, key).toString(
          CryptoJS.enc.Utf8
        );

        dispatch(addMessage({
          id: message.id,
          content: decrypted,
          username: message.username,
          user_id: message.user_id,
          unread: message.unread,
          photo: message.photo,
          chat_id: message.chat_id,
          timestamp: message.timestamp.slice(1,17),
        }));

      } else if (message.type == 'added_users') {

        setShowAddUsers(false);

        let newUser = users.filter((us) => us.id === message.id)
        setChatUsers_((usr) => [...usr, newUser[0]])
      
      } else if (message.type == 'user_deleted') {

        setUsersPhotos((prevUsers) => {
          // Use the filter method to remove the user with the specified id
          const updatedUsers = prevUsers.filter((user) => user.id !== message.user_id);
          return updatedUsers;
        });
      }
    }

    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };

  }, []);



  //  ################################################################################################### //
  //  ####################################### SEND MESSAGES LOGIC ####################################### //
  //  ################################################################################################### //

  
  const handleChange = (e) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (newMessage) {
        const key = '123'
        const encryptedMess = CryptoJS.AES.encrypt(newMessage, key).toString()
        console.log('sendMessage', encryptedMess);
        socket.send(JSON.stringify({type: 'new_message', message: encryptedMess, id: chatID }));
        setNewMessage('');
        // set up the sent message on the bottom
        window.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" })
      }
    }
  };




  //  ################################################################################################### //
  //  #################################### ADD NEW USERS TO THE CHAT #################################### //
  //  ################################################################################################### //





  //  ################################################################################################### //
  //  ########################################## DELETE MESSAGE ######################################### //
  //  ################################################################################################### //



  const deleteMess = (id, data) => {
    if (id) {
      console.log('deleteMess id', id)
      const message = {
        type: 'delete_message',
        message_id: id,
        user_id: user.id
      };
      if (socket && socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify(message));
        setShowConfirmation(false);
      }
    } else {
      console.log('deleteMess data', data)
      const message = {
        type: 'delete_user',
        user_id: data.id,
        chatId: chatID,
      };
      if (socket && socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify(message));
        setShowConfirmation(false);
        setChatUsers_((prevUsers) => {
          // Use the filter method to remove the user with the specified id
          const updatedUsers = prevUsers.filter((user) => user.id !== data.id);
          console.log('updateChatUsers', updatedUsers, data.id);
          return updatedUsers;
        });
      }
    }
  }


  const cancelDelete = () => {
    setShowConfirmation(false);
    setData(null)

  };


  const setDeleteUser = (usr) => {
    console.log('usr delete @@@@@', usr)
    setUserDelQuest(true)
    setUserToDelete(usr.id) 
    setData(usr)
    if (showConfirmation) {
      setShowConfirmation(false)
    } else {
      setShowConfirmation(true);
    }
    deleteUser()
  }

  const deleteUser = () => {
    console.log('deleteUser', userToDelete)
  }

  const confirmDelete = (id) => {
    console.log('confirmDelete, chat', id)
      setConfirmationMessage(`Are you sure you want to delete this message?`);
      setMessageToDelete(id);
      // setShowConfirmation(true);
      if (showConfirmation) {
        setShowConfirmation(false)
      } else {
        setShowConfirmation(true);
      }
  };

  const getBack = () => {
    navigate('/allChats')
  }


  const showDialog = () => {
    if ( dialog ) {
      setDialog(false)
      console.log('dialog false')
    } else {
      setDialog(true)
      console.log('dialog true')
      setShowConfirmation(true)
    }
  }

  const showAdd = () => {
    if(showAddUsers === false){
      setShowAddUsers(true)
    } else {
      setShowAddUsers(false)
    }
  }

  const addUsrs = (usrs) => {
    
    if (socket && socket.readyState === WebSocket.OPEN){
      socket.send(JSON.stringify({type: 'add_users', users: usrs, chatId: chat.id}));
      setShowConfirmation(false);      
    }
  }


  return (

    <div className='chat-container'>

        <div className='chat_header'>
  
          {showConfirmation ? (
            <div className='confirm_row_cont'> 
              <ConfirmationDialog
                data={data}
                addOpen={showAdd}
                chat_id={chat.id}
                resendMess={messageToDelete}
                message={confirmationMessage}
                onConfirm={() => deleteMess(messageToDelete, data)}
                onCancel={cancelDelete}
                user={user}
              />
            </div>
          ) : (      
            <div className='conv_row_cont'>
              <div className='conv_start'>
                <p onClick={() => getBack()}>
                  <TiArrowLeft 
                    size={35}
                  />  
                </p>      
            
                <div className='chat_users'>
                  {chatUsers_.map((usr) => (
                    <div key={usr.id}>
                      {user.username === creater ?
                        <div className='head_column' onClick={() => setDeleteUser(usr)}>
                          <img src={serverIP + usr.photo} className="userPhotoChat" alt="User Photo" />
                          <p>{usr.username}</p>
                        </div>
                        :
                        <div className='head_column'>
                          <img src={serverIP + usr.photo} className="userPhotoChat" alt="User Photo" />
                          <p>{usr.username}</p>
                        </div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <TiEquals 
                  size={30}
                  onClick={() => showDialog()}
                />
              </div>

            </div>
          )}
        </div>


        <div className={`chat ${showAddUsers ? 'blur' : ''}`} ref={chatContainerRef}>

          {messages.map((message, index) => (
            <div key={index}>
              {message.user_id === user.id ?
                <div className='message right'>
                  <div className='conf_mess'>
                    {user.photo ? 
                      <img src={serverIP + user.photo} className="userPhotoRight" />
                      :
                      <img src={serverIP + '/media/profile_photos/profile.png'} className="userPhotoRight" /> 
                    }
                    <p onClick={() => confirmDelete(message.id)}>{message.content}{' '}</p>
                  </div>
                  {message.unread ? 
                    <div className='conv_row_cont'>
                      <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                    </div> 
                    :
                      <div className='conv_row_cont'>
                        <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                      </div>
                  }
                </div>
              :
              // <div>
                <div className='message left'>
                  <div className='conf_mess'>
                    <p onClick={() => confirmDelete(message.id)}>{message.content}{' '}</p>
                    
                    {chatUsers_.map((usr, index) => (
                      <div key={index}>
                      {message.user_id === usr.id &&
                        <img src={serverIP + usr.photo} alt={usr.username} className="userPhotoLeft"/>
                      }
                      </div> 
                    ))}
                    
                    </div>
                    <div className='conv_row_cont'>
                      <p className='timestamp'>{message.timestamp.slice(0,10)}</p>
                    </div>
                </div>
              }
            </div>
          ))}
        </div>


        {showAddUsers && 
          <AddUsersToChat 
            chat_id={chat.id}
            showAddUsers={showAddUsers}
            onConfirm={addUsrs}
          />
        }

        <div className='send'>
          <input
            type="text"
            value={newMessage}
            onChange={handleChange}
            placeholder="Type your message..."
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

export default Chat;
