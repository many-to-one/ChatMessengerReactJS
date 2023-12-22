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
      unreadUserMessages: (state, action) => {
        let count = 0
        state.forEach((message) => {
          if (message.unread === true) {
            count += 1;
          }
        });
        return count;
      },
      removeMessage: (state, action) => {
        return state.filter((message) => message.id !== action.payload);
      },
      clearMessages: (state) => {
        return [];
      },
    },
  });
  
  export const { setConvId, setMessages, addMessage, markMessagesAsRead, removeMessage, lastMessage, clearMessages, unreadUserMessages } = messagesSlice.actions;
  export default messagesSlice.reducer;