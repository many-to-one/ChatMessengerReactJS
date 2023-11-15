import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../../styles/Login.css';
import { useUser } from '../../context/userContext.js'


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate();
    const { login } = useUser();

    const handleLogin = async (e) => {
      e.preventDefault()

        try {
          const postData = { email, password };
          const response = await login(postData)
          nav('/allUsers');
        } catch (error) {
          console.error('Error posting data:', error);
          setError('Error posting data')
        }
    };

    
  
    return(
        <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin} className='login_cont'>
        {error ? (
          <div className='login_cont'>
            <p>Email or login is incorrect</p>
            <input
              className='auth_error_input'
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className='auth_error_input'
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        ):(
          <div className='login_cont'>
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
          </div>
        )}
        <button type="submit">Login</button>
        <p>
          <li>
            <Link to="/register">Sing up</Link>
          </li>
        </p>
      </form>
    </div>
    );

}

export default Login;
