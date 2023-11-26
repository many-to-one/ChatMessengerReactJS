import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { serverIP } from '../../config';
import { useUser } from '../../context/userContext';

// Users slice
const messagesSlice = createSlice({
    name: 'messages',
    initialState: [],
    reducers: {
      setMessages: (state, action) => {
        return action.payload;
      },
      addMessage: (state, action) => {
        state.push(action.payload);
      },
      removeMessage: (state, action) => {
        return state.filter((message) => message.id !== action.payload);
      },
    },
  });
  
  export const { setConvId, setMessages, addMessage, removeMessage } = messagesSlice.actions;
  export default messagesSlice.reducer;


// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { serverIP } from '../../config';
// import { useUser } from '../../context/userContext';

// // Async thunk for fetching messages for a specific conversation
// export const fetchMessages = createAsyncThunk('messages/fetchMessages', async (conversationId) => {
//   const { user } = useUser();
//   // const existingMessages = getState().messages[conversationId]; // Check if messages for this conversation already exist in the state

//   // If messages are already in the state, return them
//   // if (existingMessages) {
//   //   return existingMessages;
//   // }

//   const response = await axios.get(`${serverIP}/getConversation/${conversationId}/`, {
//     headers: {
//       Authorization: `Bearer ${user.token}`,
//       userId: user.id,
//     },
//   });

//   return response.data.messages;
// });

// // Messages slice
// const messagesSlice = createSlice({
//   name: 'messages',
//   initialState: {},
//   reducers: {
//     setMessages: (state, action) => {
//       const { conversationId, messages } = action.payload;
//       state[conversationId] = messages;
//     },
//     addMessage: (state, action) => {
//       const { conversationId, message } = action.payload;
//       state[conversationId].push(message);
//     },
//     removeMessage: (state, action) => {
//       const { conversationId, messageId } = action.payload;
//       state[conversationId] = state[conversationId].filter((message) => message.id !== messageId);
//     },
//   },
// });

// // Export action creators
// export const { setMessages, addMessage, removeMessage } = messagesSlice.actions;

// // Export the reducer
// export default messagesSlice.reducer;
