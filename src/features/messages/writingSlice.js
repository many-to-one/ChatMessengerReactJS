import { createSlice } from '@reduxjs/toolkit';

const writingSlice = createSlice({
  name: 'writing',
  initialState: false, // Assuming the initial state is a boolean
  reducers: {
    setWritingStatus: (state, action) => {
      return action.payload;
    },
  },
});

export const { setWritingStatus } = writingSlice.actions;
export default writingSlice.reducer;