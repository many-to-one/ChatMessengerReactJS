import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Login.css';
import {serverIP} from '../../config.js';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const nav = useNavigate();

    const handleRegister = async (e) => {
      e.preventDefault()
      if (password !== passwordConf) {
        setErrorMessage('Password and password confirmation do not match.');
        console.log('error', password, passwordConf)
        return;
      }
      try {
        const postData = { email, password };
        const response = await axios.post(`${serverIP}/auth/register/`, postData);
        console.log('response.data', response.data);
        nav('/login');
      } catch (error) {
        console.error('Error posting data:', error);
      }
    }

    
  
    return(
        <div>
      <h2>Registration</h2>
      <form onSubmit={handleRegister} className='login_cont'>
        <input
          className='auth_input'
          type="username"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className='auth_input'
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='auth_input'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMessage ? (
          <input
            className='auth_error_input'
            type="password"
            placeholder="Confirm Password"
            value={passwordConf}
            onChange={(e) => setPasswordConf(e.target.value)}
          />
        ):(
          <input
            className='auth_input'
            type="password"
            placeholder="Confirm Password"
            value={passwordConf}
            onChange={(e) => setPasswordConf(e.target.value)}
          />
        )}
        <button type="submit">Sign up</button>
      </form>
    </div>
    );

}

export default Register;
