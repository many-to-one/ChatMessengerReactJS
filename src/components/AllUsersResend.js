import React, {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {wsIP, serverIP} from '../config.js';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/AllUsers.css';
import { useUser } from '../context/userContext.js';

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

    useEffect(() => {
      if (!resendMess) {
        navigate('/');
      }
    }, [resendMess, navigate])

    useEffect(() => {

        // Define an Axios config object with the Authorization header.
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
            userId: user.id,
          },
        };
    
        // Make an Axios GET request with the token in the headers.
        axios.get(`${serverIP}/auth/users/`, config)
          .then((response) => {
            if(response.status === 200){
              const fetchedUsers = response.data.users; 
              setUsers(fetchedUsers);
              findConvId()
            }
          })
          .catch((error) => {
            if(error.response.status === 403){
              navigate('/login')
            }else if (error.response.status === 404){
              navigate('/404')
            }
          });
      }, [user.token]);


      const findConvId = async () => {
        if (selectedUsers) {
          // selectedUsers.forEach((user) => {
          //   findIt(user);
          // });
          for(const user of selectedUsers){
            await findIt(user)
          }
        }
      };

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

          const ws = new WebSocket(
            `${wsIP}/ws/conversation/${conv_name}/?userId=${user.id}&receiverId=${convId}&token=${user.token}`
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
          console.log('message', message);
          if (message.type === 'message_deleted') {
            console.log('message_deleted', message.id);
          } else {
            console.log('message else', message)
          }
        }

      };


    const findIt = async(user_) => {

      // Fetch conversation data for the selected user based on userId.
      axios
      .post(
        `${serverIP}/conversations/`,
        {
          user: [parseInt(user.id), user_],
        },
        { 
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((response) => {
        const conversationData = response.data.conversation;
        initializeWebSocket(conversationData.id)
      })
      .catch((error) => {

      });

    }

    
      const handleUserSelect = (userId) => {

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
            {users.map((user) => (
              <div className="user-list-item" key={user.id} onClick={() =>  handleUserSelect(user.id)}>
                <div className="user-link-in">
                  {user.photo ? (
                    <img src={serverIP + user.photo} alt={user.username} className="user-photo" />
                  ) : (
                    <img src={serverIP + 'media/profile_photos/default.png'} alt={user.username} className="user-photo" />
                  )}
                  {user.username}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => findConvId()}>Send</button>
        </div>
      );
  
}

export default AllUsersResend;






