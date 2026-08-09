import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    data: [],
  },
  reducers: {
    addDataAdmin: (state, action) => {
      state.data[0] = action.payload;
    },
  },
});

export const { addDataAdmin } = adminSlice.actions;
export default adminSlice.reducer;
