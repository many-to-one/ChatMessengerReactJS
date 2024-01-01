import {  BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat';
import Login from './components/auth/Login';
import Header from './components/Header';
import Logout from './components/auth/Logout';
import Register from './components/auth/Register';
import CreateChat from './components/CreateChat';
import AllChats from './components/AllChats';
import AllUsers from './components/AllUsers';
import Conversation from './components/Conversation';
import NotFound from './components/auth/NotFound';
import AllUsersResend from './components/AllUsersResend';
import { UserProvider } from './context/userContext';
import FindFriends from './components/FindFriends';
import { Provider } from 'react-redux';
import store from './store.js'
import AddUsersToChat from './components/AddUsersToChat.js';
import AcceptCall from './components/video/AcceptCall.js';



function App() {

  return (
    <Provider store={store}>
      <UserProvider>
        <div className="App">
          <Router>
            <AppContent />
          </Router>
        </div>
      </UserProvider>
    </Provider>
  );
}

function AppContent() {
  const location = useLocation();

  // Determine if the Header should be hidden
  const isConversationPage = location.pathname === '/conversation';
  const isChatPage = location.pathname === '/chat';
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isConversationPage && !isLoginPage && !isChatPage && <Header />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/createChat" element={<CreateChat />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/allChats" element={<AllChats />} />
        <Route path="/allUsers" element={<AllUsers />} />
        <Route path="/findFriends" element={<FindFriends />} />
        <Route path="*" element={<AllUsers />} />
        <Route path="/allUsersResend" element={<AllUsersResend />} />
        <Route path="/conversation" element={<Conversation />} />
        <Route path="/addUsersToChat" element={<AddUsersToChat />}/>
        <Route path="/AcceptCall" element={<AcceptCall />}/>
      </Routes>
    </>
  );
}




// function App() {

//   const location = useLocation();

//   // Determine if the Header should be hidden
//   const isConversationPage = location.pathname === '/conversation';

//   return (
//     <UserProvider>
//       <div className="App">
//         <Router>
//         {!isConversationPage && <Header />}
//           <Routes>
//             <Route path="/register" element={<Register />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/logout" element={<Logout />} />
//             <Route path="/404" element={<NotFound />} />
//             <Route path='/createChat' element={<CreateChat />} />
//             <Route path="/chat" element={<Chat />} />
//             <Route path="/allChats" element={<AllChats />} />
//             <Route path="/allUsers" element={<AllUsers />} />
//             <Route path="/allUsersResend" element={<AllUsersResend />} />
//             <Route path="/conversation" element={<Conversation />} />
//           </Routes>
//         </Router>
//       </div>
//     </UserProvider>
//   );
// }

export default App;
