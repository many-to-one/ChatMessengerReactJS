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