import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from '../src/features/messages/messagesSlice.js';
import usersReducer from '../src/features/messages/usersSlice.js';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
    users: usersReducer,
  },
});

export default store;