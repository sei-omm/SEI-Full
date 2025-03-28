import { CampusState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CampusState = { campus: "Both" };

const campusSlice = createSlice({
  name: "campus",
  initialState,
  reducers: {
    setCampus: (state, action: PayloadAction<CampusState>) => action.payload,
  },
});

export const { setCampus } = campusSlice.actions;
export default campusSlice.reducer;
