import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverIP } from '../config.js';
import { useNavigate } from 'react-router-dom';
import '../styles/DialogWindow.css';

const ConfirmationDialog = ({ conversation, resendMess, message, onConfirm, onCancel, user, data }) => {

  const [users, setUsers] = useState([])
  const token = user.token

  // const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // deb4a2ae-31af-4918-90a8-5296390629b7e2ae3f06-fe17-4b44-95df-99d034b8d773f20ca5ef-14eb-4f49-b9e7-7ca4906077ce

    console.log('resendMess', resendMess)
    
    if ( !user ) {
      navigate("/login")
    }
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
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error.response.status);
        if(error.response.status === 403){
          navigate('/login')
        }else if (error.response.status === 404){
          navigate('/404')
        }
      });
  }, [user.token]);

  const resend = (resendMess) => {
    console.log('ConfirmationDialog', resendMess)
    navigate(`/allUsersResend?data=${resendMess}`);
  }

  return data ? (
    <div>
       <div className='conf_dialog'>
         {/* <button onClick={() => resend(resendMess)}>#</button> */}
         <button onClick={onCancel}>--</button>
         <div className='head_column'>
            <img src={serverIP + data.photo} className="userPhotoRight" alt="User Photo"></img>
            <p>{data.username}</p>
          </div>
          <button onClick={() => onConfirm(data)}>Delete?</button>
       </div>
     </div>
  ) : 
    <div>
      <div className='conf_dialog'>
        <button onClick={() => resend(resendMess)}>#</button>
        <button onClick={onConfirm}>Yes</button>
      </div>
    </div>;
};

export default ConfirmationDialog;
