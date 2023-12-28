import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {serverIP} from '../config.js';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Chat.css';
import { useUser } from '../context/userContext.js';
import '../styles/AllUsers.css';


const AllChats = (params) => {
  const [chats, setChats] = useState([])
  // const [showConfirmation, setShowConfirmation] = useState(false);
  // const [confirmationMessage, setConfirmationMessage] = useState('');
  // const [messageToDelete, setMessageToDelete] = useState(null);
  // const [delQuestion, setDelQuestion] = useState(false)
  // const chatList = []
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    axios.get(`${serverIP}/allChats/${user.id}/`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    .then((response) => {
      // console.log('response', user.id, response)
        setChats(response.data.chats)
        // for (const chat of response.data.chats) {
        //     chatList.push(chat)
        //   }
        // console.log('chatList', chatList)
    })
    .catch((error) => {
        if(error.response.status === 403){
          navigate('/')
        }else if (error.response.status === 404){
          navigate('/404')
        }
    })
  }, [navigate, user.id, user.token])

  // const cancelDelete = () => {
  //   setShowConfirmation(false);
  // };

  // const confirmDelete = (id) => {
  //     setConfirmationMessage(`Are you sure you want to delete this chat?`);
  //     setMessageToDelete(id);
  //     setShowConfirmation(true);
  // };

  // const deleteChat = (id) => {
  //   console.log('deleteChat', user.token, id)
  //   axios.get(`${serverIP}/deleteChat/${id}/`,{

  //     headers: {
  //       Authorization: `Bearer ${user.token}`,
  //     },

  // })
  // .then((response) => {
  //     console.log('deleteChat---', response.data)
  //     setShowConfirmation(false);
  //     window.location.reload()
  // })
  // .catch((error) => {
  //     console.error('Error fetching getConvMess data:', error);
  //     if(error.response.status === 403){
  //       navigate('/')
  //     }else if (error.response.status === 404){
  //       navigate('/404')
  //     }
  // })
  // }



  return (
    <div className="user-list baseCont">
      <div className="user-list-items">
        {chats.map((chat) => (
            <div className="user-list-item" key={chat.id}>
              <Link className="user-link" to="/chat" state={chat}>
                {chat.name}
              </Link>
            </div>
        ))}      
      </div>
    </div>
  );
}

export default AllChats
