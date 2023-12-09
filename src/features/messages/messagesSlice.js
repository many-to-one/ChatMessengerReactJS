import { createSlice } from '@reduxjs/toolkit';

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
      markMessagesAsRead: (state, action) => {
        const { messages } = action.payload;
        state.forEach((message) => {
          if (message.unread === true) {
            message.unread = false;
          }
        });
      },
      // markMessagesAsRead: (state, action) => {
      //   const { userId, messages } = action.payload;
        
      //   messages.forEach((message) => {
      //     const foundMessage = state.find((m) => m.id === message.id);
      
      //     if (foundMessage && foundMessage.user_id === userId) {
      //       foundMessage.unread = false;
      //     }
      //   });
      // },
      removeMessage: (state, action) => {
        return state.filter((message) => message.id !== action.payload);
      },
      clearMessages: (state) => {
        return [];
      },
    },
  });
  
  export const { setConvId, setMessages, addMessage, markMessagesAsRead, removeMessage, lastMessage, clearMessages } = messagesSlice.actions;
  export default messagesSlice.reducer;