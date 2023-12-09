import React, { createContext, useContext, useState, useEffect } from 'react';
import {wsIP, serverIP} from '../config.js';
import axios from 'axios';
import Cookies from 'js-cookie';

const UserContext = createContext();

export function UserProvider({ children }) {

  const [user, setUser] = useState(null);
  const [wsPlus, setWsPlus] = useState(null);
  const [accesToken, setAccesToken] = useState(null);
  const userId = Cookies.get('userId')

  const [ ssock, setSsock ] = useState(null)

  const setSsockTest = async(ws) => {
    setSsock(ws)
    console.log('setSsockTest', ws)
    // return ws
  }

  const login = async(postData) => {
    const response = await axios.post(`${serverIP}/auth/login/`, postData,)
    console.log('login response', response)
    if (response.status === 200){
      // userData(response.data.id)
      setUser(response.data)
      return response
    }
  }

  const userData = (userId) => {

        axios.post(`${serverIP}/auth/accessToken/`, userId,)
        .then((response) => {
            console.log('response.userData', response.data);
            // setAccesToken(response.data.AccesToken)
            setUser(response.data.user)
        })
        .catch ((error) => {
           console.error('Error posting data:', error);
           // setError('Error posting data')
        });
  }


return (
    <UserContext.Provider value={{ 
            login,
            user,
            userData,
            setSsockTest,
            ssock,
        }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
