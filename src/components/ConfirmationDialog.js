import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverIP } from '../config.js';
import { useNavigate } from 'react-router-dom';
import '../styles/DialogWindow.css';

import { TiTrash, TiArrowBackOutline, TiArrowLeft, TiUserAddOutline } from "react-icons/ti";

const ConfirmationDialog = ({ conversation, resendMess, message, onConfirm, onCancel, user, data, chat_id, addOpen }) => {

  const [users, setUsers] = useState([])
  const [delChatConf, setDelChatConf] = useState(false)
  const token = user.token

  // const { user } = useUser();
  const navigate = useNavigate();

  // console.log('resendMess', resendMess)
  // console.log('onConfirm', onConfirm)
  // console.log('onCancel', onCancel)
  // console.log('user', user)
  // console.log('data', data)
  // console.log('chat_id', chat_id)
  // console.log('addOpen', addOpen)


  useEffect(() => {
    
    if ( !user ) {
      navigate("/")
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
          navigate('/')
        }else if (error.response.status === 404){
          navigate('/404')
        }
      });
  }, [user.token]);

  const resend = (resendMess) => {
    console.log('ConfirmationDialog', resendMess)
    navigate(`/allUsersResend?data=${resendMess}`);
  }


  const delChat_ = (id) => {
    console.log('delChat_', id)
    setDelChatConf(true)
  }


  const delChatAbsolute = (id) => {

    const data = {
      headers: {
        Authorization: `Bearer ${user.token}`,
        userId: user.id,
      },
    };

    axios.get(`${serverIP}/deleteChat/${id}/`, data)
    .then((response) => {
      if(response.status === 200){
        navigate('/AllChats')
      }
    })
    .catch((error) => {
      navigate('/')
    })
  }


  // const addUsersToChat = () => {
  //   navigate(`/addUsersToChat?data=${chat_id}`)  
  // }


  return data ? (
    <div>
       <div className='conf_dialog'>
         <p onClick={onCancel}>
          <TiArrowLeft 
            size={35}
          />  
        </p> 
         <div className='head_column'>
            <img src={serverIP + data.photo} className="userPhotoChat" alt="User Photo" />
            <p>{data.username}</p>
          </div>
          <TiTrash 
            onClick={() => onConfirm(data)}
            size={45}
          />
       </div>
     </div>
  ) : 
  
    chat_id ? (

      delChatConf ? (
        <div>
          <div className='conf_dialog'>
            <p onClick={onCancel}>
              <TiArrowLeft 
                size={35}
              />  
            </p>  
            <p>Delete chat?</p>
            <TiTrash 
                size={45}
                onClick={() => delChatAbsolute(chat_id)}
              />
          </div>
        </div>
      ) : (
        resendMess ? (
          <div>
            <div className='conf_dialog'>
              <TiArrowBackOutline 
                size={30}
                onClick={() => resend(resendMess)}
              />
              <TiTrash 
                  size={30}
                  onClick={onConfirm}
                />
            </div>
          </div>
        ) : (
          <div>
          <div className='conf_dialog'>
            <p onClick={onCancel}>
              <TiArrowLeft 
                size={35}
              />  
            </p>  
            <TiUserAddOutline 
              size={45}
              onClick={addOpen}
            />
            <TiTrash 
                size={45}
                onClick={() => delChat_(chat_id)}
              />
          </div>
        </div>
        )
      )
      
    ) : (
      <div>
      <div className='conf_dialog'>
        <TiArrowBackOutline 
          size={30}
          onClick={() => resend(resendMess)}
        />
        <TiTrash 
            size={35}
            onClick={onConfirm}
          />
      </div>
    </div>
    )
};

export default ConfirmationDialog;
