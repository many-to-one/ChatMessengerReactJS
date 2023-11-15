import React, {useEffect, useState} from "react";
import { serverIP } from '../config.js';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/userContext.js';


const CreateChat = (props) => {
  
    const { user } = useUser();
    const [name, setName] = useState('');
    const [users, setUsers] = useState([]);
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([user.id]);
    const [error, setError] = useState('')
    const [isChat, setIsChat] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        // Define the URL for fetching users
        const usersURL = `${serverIP}/auth/users/`;
    
        // Make an HTTP GET request to fetch users
        axios.get(usersURL, 
           {
            headers: {
              Authorization: `Bearer ${user.token}`,
              userID: `${user.id}`
            }
           }
          )
          .then((response) => {
            // On success, set the retrieved users in state
            setUsers(response.data.users);
            console.log('allUsersList', response.data.users)
          })
          .catch((error) => {
            // On error, set the error state
            setError(error);
            if(error.response.status === 403){
              navigate('/login')
            }else if (error.response.status === 404){
              navigate('/404')
            }
          });

      }, []);
  
    const handleCreateChatRoom = async () => {
      console.log('selectedUsers', selectedUsers)
      try {
        const response = await axios.post(`${serverIP}/createChat/`, 
          {
            name: name,
            user: selectedUsers,
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              userID: `${user.id}`
            }
          }
      );
  
        if (response.status === 201) {
          setMessage('Chat room created successfully!');
          setChat(response.data.chat);
          setIsChat(true)

          // Clear the input fields and unselect the users
          setName('');
          setSelectedUsers([]);
          
        } else {
          setMessage('Failed to create chat room.');
        }
      } catch (error) {
        console.error('Error creating chat room:', error);
        setMessage('Failed to create chat room.');
        if(error.response.status === 403){
          navigate('/login')
        }else if (error.response.status === 404){
          navigate('/404')
        }
      }
    };

    const handleUserSelect = (userId) => {
        // Check if the userId is already included in the selectedUsers array. 
        // If it's, that means the user is currently selected and needs to be deselected.
        if (selectedUsers.includes(userId)) {
          setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
          // Select users
          setSelectedUsers([...selectedUsers, userId]);
        }
      };

    return (
      <div>
        <h2>Create Chat Room</h2>
        <div>
          <label htmlFor="name">Chat Room Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
        <label>Users:</label>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              <input
                type="checkbox"
                value={u.id}
                checked={selectedUsers.includes(u.id)}
                onChange={() => handleUserSelect(u.id)}
              />
              {u.username}
            </li>
          ))}
        </ul>
      </div>
        { isChat ? (
            <Link to="/chat" state={chat}>Go Chat</Link>
        ):(
          <button onClick={handleCreateChatRoom}>Create Chat Room</button>
        )}
        <div>{message}</div>
      </div>
    );

}

export default CreateChat;
