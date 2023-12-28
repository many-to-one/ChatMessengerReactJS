import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from '../src/features/messages/messagesSlice.js';
import usersReducer from '../src/features/messages/usersSlice.js';
// import friendRequestReducer  from '../src/features/messages/friendRequestSlice.js';
import writingReducer from '../src/features/messages/writingSlice.js';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
    users: usersReducer,
    // friendRequests: friendRequestReducer,
    writing: writingReducer,
  },
});

export default store;