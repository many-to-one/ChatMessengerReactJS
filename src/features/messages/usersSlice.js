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