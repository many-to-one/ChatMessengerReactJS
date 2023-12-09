import { createSlice } from '@reduxjs/toolkit';

const friendRequestSlice = createSlice({
  name: 'friendRequests',
  initialState: [],
  reducers: {
    addFriendRequest: (state, action) => {
      // Add the new friend request to the state
      state.push(action.payload);
    },
    removeFriendRequest: (state, action) => {
      // Remove the friend request with the specified user id from the state
      return state.filter((request) => request.id !== action.payload);
    },
    clearFriendRequests: (state) => {
      // Clear all friend requests from the state
      return [];
    },
  },
});

export const { addFriendRequest, removeFriendRequest, clearFriendRequests } = friendRequestSlice.actions;
export default friendRequestSlice.reducer;
