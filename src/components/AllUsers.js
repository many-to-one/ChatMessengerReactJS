import React, {useEffect, useState} from 'react';
import { serverIP, wsIP } from '../config.js';
import { useNavigate } from 'react-router-dom';
import '../styles/AllUsers.css';
import { useUser } from '../context/userContext.js';
import IncomingRequest from './IncomingRequest.js';
import ChatWithUser from './ChatWithUser.js';
import axios from 'axios';
import CryptoJS from "crypto-js";

import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage, removeMessage } from '../features/messages/messagesSlice.js';
import { setUser, addUser, removeUser } from '../features/messages/usersSlice.js';


const AllUsers = (params) => {

    const [socket, setSocket] = useState([])
    const [incomingRequest, setIncomingRequest] = useState([])
    const [lastMess, setLastMess] = useState([]);
    const conv_name = 13

    const navigate = useNavigate();
    const { user, setSsockTest } = useUser();

    const dispatch = useDispatch();
    const allMessages = useSelector((state) => state.messages);
    const users = useSelector((state) => state.users);


      useEffect(() => {

        const fetchMessages = async () => {
          if (user.token !== null) {
            { allMessages.length === 0 &&
            await axios
            .get(`${ serverIP }`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              }
            })
            .then((response) => {
              const decryptedMessages = response.data.messages.map((data) => {
                const key = '123';
                const decryptedContent = CryptoJS.AES.decrypt(data.content, key).toString(CryptoJS.enc.Utf8);
                return { ...data, content: decryptedContent };
              });
              dispatch(setMessages(decryptedMessages));
            })
            .catch((error) => {
              console.log('Error messageList', error)
              navigate('/')
            })
          }
          } else {
            navigate('/')
          }
        }

        fetchMessages()
      }, [])


      useEffect(() => {

        if ( users.length === 0 ) {
          friendList()
        }

      }, [user])


      const friendList = () => {

        axios
            .get(`${ serverIP }/auth/friends/`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              }
            })
            .then((response) => {
              console.log('friendsList', response)
              dispatch(setUser(response.data.user_data));
            })
            .catch((error) => {
              console.log('Error friendsList', error)
            })

      }


      useEffect(() => {
        
        if ( user ) {
          const ws = new WebSocket(`${wsIP}/ws/AllUsers/${conv_name}/?userId=${user.id}&token=${user.token}`);
          setSocket(ws)

          // console.log('getAllUsers', ws)

        // checkIncomeFriendRequest()

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          // console.log('ALL DATA', data);

          if (data.type === 'allUsers') {

            // console.log('allUsers', data, data.type);
            // console.log('friends_count', data.friends_count.count);

            if ( users.length < data.friends_count.count ) {
              friendList()
              console.log('count < ');
            }
            // dispatch(setUser(data.users));

            // setUsers(data.users)
            setIncomingRequest(data.incomingFriendRequest)

          } else if (data.type === 'addFriend_') {

            console.log('addFriend data', data);
          
          } else if (data.type === 'checkFriendRequest') { 

            console.log('checkFriendRequest data', data);

          } else if (data.type === 'confirmRequest') {

            console.log('confirmRequest data', data.user);
            // setUser(data.users)
            dispatch(addUser(data.user));
            // Remove the added user from request list
            // {data.user.map((user) => {
              setIncomingRequest((prevUsers) => {
                // Use the filter method to remove the user with the specified id
                const updatedUsers = prevUsers.filter((u) => u.id !== data.user.id);
                return updatedUsers;
              });
            // })}

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




      const confirmRequest = (id) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('confirmRequest', 'socket OPEN', id)
          socket.send(JSON.stringify({type: 'confirmRequest', requestId: id, userId: user.id}));
        }
        setIncomingRequest((prevUsers) => {
          // Use the filter method to remove the user with the specified id
          const updatedUsers = prevUsers.filter((u) => u.id !== id);
          return updatedUsers;
        });
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
        setUser((prevUsers) => {
          const updatedUsers = prevUsers.filter((u) => u.username.toLowerCase().includes(text.toLowerCase()))
          return updatedUsers;
        });
      };



      return (
        <div className="user-list baseCont">

          {incomingRequest ? (
            <div className="user-list-items">
              {incomingRequest.map((userR) => (
                <IncomingRequest 
                  user={userR}
                  blockUser={() => blockUser(userR.id)}
                  denyRequest={() => denyRequest(userR.id)}
                  confirmRequest={() => confirmRequest(userR.id)}
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

            {users.map((user_) => (
              <ChatWithUser 
                user_={user_}
                lastMess={lastMess}
              />
            ))}
          </div>
        </div>
      );
  
}

export default AllUsers;
