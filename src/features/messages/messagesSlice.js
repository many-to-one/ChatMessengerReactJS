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
      removeMessage: (state, action) => {
        return state.filter((message) => message.id !== action.payload);
      },
      clearMessages: (state) => {
        return [];
      },
    },
  });
  
  export const { setConvId, setMessages, addMessage, removeMessage, clearMessages } = messagesSlice.actions;
  export default messagesSlice.reducer;