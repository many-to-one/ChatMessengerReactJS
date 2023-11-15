import React, { useEffect, useRef, useState } from 'react';
import { w3cwebsocket as WebSocket } from 'websocket';
import axios from 'axios';
import {wsIP, serverIP} from '../config.js';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Chat.css';
import ConfirmationDialog from './ConfirmationDialog.js';
import { useUser } from '../context/userContext.js';
import AddUsersToChat from './AddUsersToChat.js';

const Chat = (props) => {

  const { user } = useUser();
  const navigate = useNavigate();

  const [data, setData] = useState(null)

  const [messages, setMessages] = useState([]);
  const [usersPhotos, setUsersPhotos] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const mess = [];
  const [chatUsers, setChatUsers] = useState([{userId:user}]);
  const [userList, setUserList] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState([]);
  const [userDelQuest, setUserDelQuest] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // const to make a new message been on the bottom of the chat
  const chatContainerRef = useRef(null);

  // Reseived props:
  const location = useLocation()
  const chat = location.state 
  const chatID = chat.id

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
  //  ##################################### SHOW ALL CHAT MESSAGES ###################################### //
  //  ################################################################################################### //


  const allMessages = async () => {

    axios
    .get(
      `${serverIP}/allMessages/${chatID}/`,
      { 
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    )
    .then((response) => {
      console.log('response.data Chat', response.data)
      for (const message of response.data.messages) {
        const messageObject = {
          id: message.id,
          username: message.username,
          message: message.content,
          photo: message.photo,
        };
        mess.push(messageObject);
      }
      setMessages(mess)
      setChatUsers(response.data.chat.user)
      setUsersPhotos(response.data.photos)
      console.log('usersPhotos', usersPhotos)
    })
    .catch((error) => {
      console.error('Error fetching conversation data:', error);
      if(error.response.status === 403){
        nav('/login')
      }else if (error.response.status === 404){
        nav('/404')
      }
    });

  }



  //  ################################################################################################### //
  //  ##################################### CONNECT TO THE SOCKET ####################################### //
  //  ################################################################################################### //


  
  useEffect(() => {

    const ws = new WebSocket(`${wsIP}/ws/chat/${chatID}/?userId=${user.id}&token=${user.token}`);
  setSocket(ws);

    if(ws) {
      ws.onopen = () => {
        console.log('WebSocket connection opened');
        allMessages()
      };
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        nav('/login'); 
      };
    } else {
      nav('/login')
    }


    // Receive data from server via socket
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('message', message);
      if (message.type === 'message_deleted') {
        console.log('message_deleted', message.id);
        // Handle message deletion by filtering out the deleted message
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.filter((msg) => msg.id !== message.id);
          console.log('updatedMessages', updatedMessages);
          return updatedMessages;
        });
      } else if (message.type == 'added_message') {
        setMessages((prevMessages) => [...prevMessages, { id: message.id, message: message.message, username: message.username, photo: message.photo }]);
        // scrollToBottom();
      } else if (message.type == 'added_users') {
        setSelectedUsers((prevMessages) => [...prevMessages, { users: message, }]);
        setChatUsers((prevMessages) => [...prevMessages, message.id]); 
        console.log('ChatUsers', chatUsers);

        setUsersPhotos((prevPhotos) => {
          const userPhotoToUpdate = prevPhotos.find((photo) => photo.username === message.username);
        
          if (userPhotoToUpdate) {
            // Update the existing user's photo if found
            return prevPhotos.map((photo) => {
              if (photo.username === message.username) {
                return { ...photo, photo: message.photo };
              }
              return photo;
            });
          } else {
            // Add a new user with photo if not found
            return [...prevPhotos, { id: message.id, username: message.username, photo: message.photo }];
          }
        });
      } else if (message.type == 'user_deleted') {
        setUsersPhotos((prevUsers) => {
          // Use the filter method to remove the user with the specified id
          const updatedUsers = prevUsers.filter((user) => user.id !== message.user_id);
          return updatedUsers;
        });
        setChatUsers((prevUsers) => {
          // Use the filter method to remove the user with the specified id
          const updatedUsers = prevUsers.filter((user) => user !== message.user_id);
          console.log('updateChatUsers', updatedUsers, message.user_id);
          return updatedUsers;
        });
      }
    }

    // setSocket(ws);

    return () => {
      if (socket) {
        socket.close();
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
        socket.send(JSON.stringify({type: 'new_message', message: newMessage, id: chatID }));
        setNewMessage('');
        // set up the sent message on the bottom
        window.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" })
      }
    }
  };




  //  ################################################################################################### //
  //  #################################### ADD NEW USERS TO THE CHAT #################################### //
  //  ################################################################################################### //



  const addUsers = () => {

    console.log('addUsers chatUsers', chatUsers)

    // Define the URL for fetching users
    const usersURL = `${serverIP}/auth/users/`;
    
    // Make an HTTP GET request to fetch users
    axios.post(usersURL, 
      {chatUsers},
       {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
       }
      )
      .then((response) => {
        // On success, set the retrieved users in state
        console.log('allUsersList', response.data)
        setUserList(response.data.usersToChat)
        // setShowUserList(true)
        if (showUserList === false){
          setShowUserList(true)
        } else {
          setShowUserList(false)
        }
      })
      .catch((error) => {
        // On error, set the error state
        // setError(error);
        if(error.response.status === 403){
          nav('/login')
        }else if (error.response.status === 404){
          nav('/404')
        }
      });
  }

  const confirmUsers = (users_) => {
    const users = {
      type: 'add_users',
      users: users_,
      chatId: chatID,
    };
    // setSelectedUsers(users_)
    console.log('selectedUsers', users)
    if (socket && socket.readyState === WebSocket.OPEN){
      socket.send(JSON.stringify(users));
    }
    setShowUserList(false)
  }; 



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
      }
    }
  }

  const cancelDelete = () => {
    setShowConfirmation(false);
    setData(null)

  };


  const setDeleteUser = (usr) => {
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

  return (
    <div className='chat-container'>

        <div className='conv_header'>
  
          {showConfirmation ? (
            <div className='confirm_row_cont'>
              {/* <p onClick={() => getBack()}>@</p>  */}
              <ConfirmationDialog
                data={data}
                // isOpen={showConfirmation}
                resendMess={messageToDelete}
                message={confirmationMessage}
                onConfirm={() => deleteMess(messageToDelete, data)}
                onCancel={cancelDelete}
                user={user}
              />
            </div>
          ) : (      
            <div className='conv_row_cont'>
              <p onClick={() => getBack()}>@</p>      
              <div className='conv_start'>
                {usersPhotos.map((usr) => (
                  <div key={usr.id}>
                    <div className='head_column' onClick={() => setDeleteUser(usr)}>
                      <img src={serverIP + usr.photo} className="userPhotoRight" alt="User Photo" />
                      <p>{usr.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='chat' ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index}>
              {message.username === user.username ?
                <div className='message right'>
                  <div className='conf_dialog'>
                    {message.photo ? 
                      <img src={serverIP + message.photo} className="userPhotoRight" />
                      :
                      <img src={serverIP + 'media/profile_photos/default.png'} className="userPhotoRight" /> 
                    }
                    <p onClick={() => confirmDelete(message.id)}>{message.message}{' '}x</p>
                  </div>
                  {message.unread ? 
                    <p className='unread'>-</p> 
                    :
                    <p className='unread'>+</p>
                  }
                </div>
              :
              <div>
                <strong>{message.username}</strong>
                <div className='message left'>
                  <p>{message.message}</p>
                </div>
              </div>
              }
            </div>
          ))}
        </div>

        <AddUsersToChat
          isOpen={showUserList}
          userList={userList}
          onConfirm={confirmUsers}
        />

        <div className='send'>
          <button className='sendButton' onClick={() => addUsers()}>+</button>
          <input
            type="text"
            value={newMessage}
            onChange={handleChange}
            placeholder="Type your message..."
          />
          <button className='sendButton' onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
