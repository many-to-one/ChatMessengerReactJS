import React, {useEffect, useState} from 'react';
import { serverIP, wsIP } from '../config.js';
import { useNavigate } from 'react-router-dom';
import '../styles/AllUsers.css';
import { useUser } from '../context/userContext.js';
import IncomingRequest from './IncomingRequest.js';
import ChatWithUser from './ChatWithUser.js';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from '../features/messages/messagesSlice.js';

const AllUsers = (params) => {

    const [users, setUsers] = useState([])
    const [socket, setSocket] = useState([])
    const [incomingRequest, setIncomingRequest] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [friend, setFriend] = useState(null)
    const conv_name = 1


    const navigate = useNavigate();
    const { user } = useUser();

    const dispatch = useDispatch();
    const allMessages = useSelector((state) => state.messages);

      useEffect(() => {
        console.log('allMessages', allMessages)

        { allMessages.length === 0 &&
          axios
            .get(`${ serverIP }`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              }
            })
            .then((response) => {
              dispatch(setMessages(response.data.messages));
              console.log('response', response.data.messages)
            })
            .catch((error) => {
              console.log('Error messageList', error)
              navigate('/login')
            })
        }
      }, [])

      useEffect(() => {
        
        if ( user ) {
          const ws = new WebSocket(`${wsIP}/ws/AllUsers/${conv_name}/?userId=${user.id}&token=${user.token}`);
          setSocket(ws)

          console.log('getAllUsers', ws)

        checkIncomeFriendRequest()

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'allUsers') {

            console.log('allUsers', data, data.type);
            console.log('friendReq', data.incomingFriendRequest);
            setUsers(data.users)
            setIncomingRequest(data.incomingFriendRequest)

          } else if (data.type === 'addFriend') {

            console.log('addFriend data', data);

          } else if (data.type === 'checkFriendRequest') { 

            console.log('checkFriendRequest data', data);

          } else if (data.type === 'confirmRequest') {

            console.log('confirmRequest data', data);
            setUsers(data.users)
            // Remove the added user from request list
            {data.users.map((user) => {
              setIncomingRequest((prevUsers) => {
                // Use the filter method to remove the user with the specified id
                const updatedUsers = prevUsers.filter((u) => u.id !== user.id);
                return updatedUsers;
              });
            })}

          } else if (data.type === 'blockResponse') {
            console.log('blockResponse', data)
          } else if (data.type === 'mess_count') {
            console.log('mess_count data', data);
          }
        }
        
          return () => {
            if (ws) {
              ws.close();
            }
          };

        } else {
          navigate("/login")
        }

}, [])



      const checkIncomeFriendRequest = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('friendRequest', 'socket OPEN')
          socket.send(JSON.stringify({type: 'checkFriendRequest', userId: user.id}));
        }
      };



      const confirmRequest = (id) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('confirmRequest', 'socket OPEN', id)
          socket.send(JSON.stringify({type: 'confirmRequest', requestId: id, userId: user.id}));
        }
      }


      const denyRequest = (id) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('denyRequest', 'socket OPEN', id)
          socket.send(JSON.stringify({type: 'denyRequest', requestId: id, userId: user.id}));
          setIncomingRequest((prefUsers) => {
            const updateList = prefUsers.filter((u) => u.id !== id)
            return updateList
          })
        }
      }


      const blockUser = (id) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('blockUser', 'socket OPEN', id)
          socket.send(JSON.stringify({type: 'blockUser', requestId: id, userId: user.id}));
          setIncomingRequest((prefUsers) => {
            const updateList = prefUsers.filter((u) => u.id !== id)
            return updateList
          })
        }
      }


      const searchUsers = (text) => {
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter((u) => u.username.toLowerCase().includes(text.toLowerCase()))
          return updatedUsers;
        });
      };



      return (
        <div className="user-list baseCont">

          {incomingRequest ? (
            <div className="user-list-items">
              {incomingRequest.map((user) => (
                <IncomingRequest 
                  user={user}
                  blockUser={() => blockUser(user.id)}
                  denyRequest={() => denyRequest(user.id)}
                  confirmRequest={() => confirmRequest(user.id)}
                />
              ))}
              <hr></hr>
            </div>
          )
            : 
            null
          }

          <div className="user-list-items">

          <div className="user-input-item">
            <input
              className="user-link-in"
              type="text"
              placeholder="Search users..."
              onChange={(e) => searchUsers(e.target.value)}
            />
          </div>
          <hr></hr>

            {users.map((user) => (
              <ChatWithUser 
                user={user}
              />
            ))}
          </div>
        </div>
      );
  
}

export default AllUsers;
