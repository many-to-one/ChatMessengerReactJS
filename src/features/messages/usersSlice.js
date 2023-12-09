import { createSlice } from '@reduxjs/toolkit';

// Users slice
const usersSlice = createSlice({
    name: 'users',
    initialState: [],
    reducers: {
      setUser: (state, action) => {
        return action.payload;
      },
      addUser: (state, action) => {
        state.push(action.payload);
      },
      // lastMessage: (state, action) => {
      //   console.log('lastMessage reducer called with action:', action);
      //   // Find the user by user_id
      //   const userToUpdate = state.find((user) => user.id === action.payload.user_id);
  
      //   // If the user is found, update their lastMessage
      //   if (userToUpdate) {
      //     userToUpdate.last_mess = {
      //       content: action.payload.last_mess.content,
      //       timestamp: action.payload.last_mess.timestamp,
      //       unread: action.payload.last_mess.unread,
      //     };
      //   }
      // },
      removeUser: (state, action) => {
        return state.filter((user) => user.id !== action.payload);
      },
      clearUsers: (state) => {
        return [];
      },
    },
  });
  
  export const { setUser, addUser, lastMessage, removeUser, clearUsers } = usersSlice.actions;
  export default usersSlice.reducer;