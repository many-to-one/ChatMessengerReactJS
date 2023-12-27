import React, {useEffect, useState} from 'react';
import { wsIP } from '../config.js';
import { useNavigate } from 'react-router-dom';
import '../styles/AllUsers.css';
import { useUser } from '../context/userContext.js';
import QuestionFriend from './QuestionFriend.js';
import User from './User.js';

import { useDispatch, useSelector } from 'react-redux';
// import { addFriendRequest, removeFriendRequest, clearFriendRequests } from '../features/messages/friendRequestSlice.js';

const FindFriends = (params) => {

    const [users, setUsers] = useState([])
    const [socket, setSocket] = useState([])
    const [socketo, setSocketo] = useState([])
    const [outcomingRequest, setOutcomingRequest] = useState([])
    const [friend, setFriend] = useState(null)
    const [dialog, setDialog] = useState(false)
    const conv_name = 1

    const navigate = useNavigate();
    const { user } = useUser();

    const dispatch = useDispatch();
    // const allFriendRequests = useSelector((state) => state.friendRequests);


    useEffect(() => {
        
        if ( user ) {
          const ws = new WebSocket(`${wsIP}/ws/AllUsers/?userId=${user.id}&token=${user.token}`);
          setSocket(ws)

          console.log('getAllUsers', ws)

          ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'allUsers') {
            setUsers(data.findFriends)
            console.log('allUsers', data);
            if ( data.outComingFriendRequest ) { 
              { data.outComingFriendRequest.map((user) => {
                setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id))
              }) }
            } if ( data.incomingFriendRequest ) { console.log('data.incomingFriendRequest !', data.incomingFriendRequest);
              { data.incomingFriendRequest.map((user_) => {
                  setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user_.id))
                  // dispatch(addFriendRequest({
                  //   from: user_,
                  //   to: user
                  // }))
                })}
              }
            setOutcomingRequest(data.outComingFriendRequest)
          } else if (data.type === 'addFriend_') {
            console.log('addFriend data', data);
            {data.request.map((user) => {
              setUsers((prevUsers) => 
                prevUsers.filter((u) => u.id !== user.id)
              )
              setOutcomingRequest((prevUsers) => {
                if (!prevUsers.some((u) => u.id === user.id)) {
                  return [...prevUsers, user];
                }
                return prevUsers;
              });

            })}
          } 
        }
        
          return () => {
            if (ws) {
              ws.close();
            }
          };

        } else {
          navigate("/")
        }

      }, [])


      const friendRequest = () => {

        console.log('friendRequest --- id', friend)

        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('friendRequest', 'socket OPEN')
          if (friend) {
            console.log('friendRequest', 'friend -', friend)
            socket.send(JSON.stringify({type: 'friendRequest', requestId: friend, userId: user.id}));
            setFriend(null);
            setDialog(false)
          }
        }
      };



      const letAdd = (id) => {
        console.log('id', id)
        setFriend(id)
        setDialog(true)
      }


      const letCancel = () => {
        setFriend(null)
        setDialog(false)
      }



      const test = () => {
        if (socketo && socketo.readyState === WebSocket.OPEN) {
          console.log('test clicked!')
          socketo.send(JSON.stringify({type: 'test', userId: user.id}));
        }
      }



      return (
        <div className="user-list baseCont">
          {dialog ? (
            <div className='confirm_row_cont'>
            <QuestionFriend 
              message={'Add friend?'}
              isOpen={dialog}
              onConfirm={() => friendRequest()}
              onCancel={() => letCancel()}
            />
            </div>
          )
            :
            null
          }

          {outcomingRequest && (
            <div className="user-list-items">
            {outcomingRequest.map((user) => (
              <User 
                user={user}
                outcomingRequest={outcomingRequest}
              />
            ))}
          </div>
          )}

          <hr></hr>

          <div className="user-list-items">
            {users.map((user) => (
              <User 
                user={user}
                onConfirm={() => letAdd(user.id)}
              />
            ))}
          </div>
          {/* <button onClick={test}>Test</button> */}
        </div>
      );
}

export default FindFriends
