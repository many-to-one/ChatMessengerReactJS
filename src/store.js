import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from '../src/features/messages/messagesSlice.js';
import usersReducer from '../src/features/messages/usersSlice.js';
import chatUsersReducer from '../src/features/messages/chatUsersSlice.js';
// import friendRequestReducer  from '../src/features/messages/friendRequestSlice.js';
import writingReducer from '../src/features/messages/writingSlice.js';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
    users: usersReducer,
    chatUsers: chatUsersReducer,
    // friendRequests: friendRequestReducer,
    writing: writingReducer,
  },
});

export default store;