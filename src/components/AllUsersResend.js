import React, {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {wsIP, serverIP} from '../config.js';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/AllUsers.css';
import { useUser } from '../context/userContext.js';

import { useDispatch, useSelector } from 'react-redux';
import { addMessage, removeMessage, markMessagesAsRead } from '../features/messages/messagesSlice.js';
import ChatWithUser from './ChatWithUser.js';
import ResendUser from './ResendUser.js';

const AllUsersResend = (params) => {

    const [users, setUsers] = useState([])
    const [socket, setSocket] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();
    const conv_name = 1;

    // Access the state passed from the ConfirmationDialog
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const resendMess = searchParams.get('data');

    const { user } = useUser();

    const dispatch = useDispatch();
    const allMessages = useSelector((state) => state.messages);
    const usersForReasend = useSelector((state) => state.users);

    useEffect(() => {
      if (!resendMess) {
        navigate('/');
      } 

    }, [resendMess, navigate])

    // useEffect(() => {

    //   console.log('usersForReasend', usersForReasend)

    //     // Define an Axios config object with the Authorization header.
    //     const config = {
    //       headers: {
    //         Authorization: `Bearer ${user.token}`,
    //         userId: user.id,
    //       },
    //     };
    
    //     // Make an Axios GET request with the token in the headers.
    //     axios.get(`${serverIP}/auth/users/`, config)
    //       .then((response) => {
    //         if(response.status === 200){
    //           const fetchedUsers = response.data.users; 
    //           // console.log('usersForReasend', usersForReasend)
    //           setUsers(fetchedUsers);
    //           findConvId()
    //         }
    //       })
    //       .catch((error) => {
    //         if(error.response.status === 403){
    //           navigate('/login')
    //         }else if (error.response.status === 404){
    //           navigate('/404')
    //         }
    //       });
    //   }, [user.token]);


      const test = async () => {
        if (selectedUsers) {
          // selectedUsers.forEach((user) => {
          //   findIt(user);
          // });
          for(const _user of selectedUsers){
            console.log('working')
            initializeWebSocket(_user.conv)
          }
        }
      };


    //   const findIt = async(user_) => {

    //     // Fetch conversation data for the selected user based on userId.
    //     axios
    //     .post(
    //       `${serverIP}/conversations/`,
    //       {
    //         user: [parseInt(user.id), user_],
    //       },
    //       { 
    //         headers: {
    //           Authorization: `Bearer ${user.token}`,
    //         },
    //       }
    //     )
    //     .then((response) => {
    //       const conversationData = response.data.conversation;
    //       console.log('conversationData', conversationData)
    //       initializeWebSocket(conversationData.id)
    //     })
    //     .catch((error) => {
  
    //     });
  
    //   }


      const waitForOpenConnection = (socket) => {
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 10
            const intervalTime = 200 //ms
    
            let currentAttempt = 0
            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval)
                    reject(new Error('Maximum number of attempts exceeded'))
                } else if (socket.readyState === socket.OPEN) {
                    clearInterval(interval)
                    resolve()
                }
                currentAttempt++
            }, intervalTime)
        })
    }
    
      const initializeWebSocket = async (convId) => {

        console.log('initializeWebSocket', convId) 

          const ws = new WebSocket(
            // `${wsIP}/ws/conversation/${conv_name}/?userId=${user.id}&receiverId=${convId}&token=${user.token}`
            `${wsIP}/ws/conversation/${convId}/?userId=${user.id}`
          );
          setSocket(ws);
          if (ws.readyState !== ws.OPEN) { 
            try {
                await waitForOpenConnection(ws)
                ws.send(JSON.stringify({ type: 'resend_message', message: resendMess, id: convId }));
                navigate('/allUsers')
            } catch (err) { console.error(err) }
        } else {
          ws.send(JSON.stringify({ type: 'resend_message', message: resendMess, id: convId }));
          navigate('/allUsers')
        }

        // message logic
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'message_deleted') {
            console.log('message_deleted', message.id);
          } 
          if (message.type === 'resend_message_') {
            console.log('resend_message_', message);
            dispatch(addMessage({
              id: message.id,
              content: message.content,
              username: message.username,
              user_id: message.user_id,
              unread: message.unread,
              photo: message.photo,
              conversation_id: convId,
              resend: true,
              timestamp: message.timestamp,
            }));
          }
          // console.log('resend store, convId', allMessages, convId)
        }

      };

    
      const handleUserSelect = (userId) => {
        console.log('handleUserSelect', userId.conv)
        // initializeWebSocket(userId.conv)
        setSelectedUsers((prevSelectedUsers) => {
          if (prevSelectedUsers.includes(userId)) {
            // User is already selected, so remove them
            const updatedUsers = prevSelectedUsers.filter((id) => id !== userId);
            return updatedUsers;
          } else {
            // User is not selected, so add them
            const updatedUsers = [...prevSelectedUsers, userId];
            return updatedUsers;
          }
        });

      };    

      return (
        <div className="user-list baseCont">
          <div className="user-list-items">
            {usersForReasend.map((user_) => (
              <div >
                <ResendUser 
                  user_={user_}
                  resendMess={resendMess}
                />
              </div>
  
              // <div className="user-list-item" key={user.id} onClick={() =>  handleUserSelect(user)}>
              //   <div className="user-link-in">
              //     {user.photo ? (
              //       <img src={serverIP + user.photo} alt={user.username} className="user-photo" />
              //     ) : (
              //       <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="user-photo" />
              //     )}
              //     {user.username}
              //   </div>
              // </div>
            ))}
          </div>
          <button onClick={() => test()}>Send</button>
        </div>
      );
  
}

export default AllUsersResend;






