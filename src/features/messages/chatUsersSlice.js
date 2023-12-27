import { createSlice } from '@reduxjs/toolkit';

// Users slice
const chatUsersSlice = createSlice({
    name: 'chatUsers',
    initialState: [],
    reducers: {
      setChatUser: (state, action) => {
        return action.payload;
      },
      addChatUser: (state, action) => {
        state.push(action.payload);
      },
      removeChatUser: (state, action) => {
        return state.filter((user) => user.id !== action.payload);
      },
      clearChatUsers: (state) => {
        return [];
      },
    },
  });
  
  export const { setChatUser, addChatUser, removeChatUser, clearChatUsers } = chatUsersSlice.actions;
  export default chatUsersSlice.reducer;