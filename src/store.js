import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from '../src/features/messages/messagesSlice.js';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
  },
});

export default store;