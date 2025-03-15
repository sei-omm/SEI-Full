import { TSideBar } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: TSideBar[] = [];

const sideBarSlice = createSlice({
  initialState,
  name: "SideBarSlice",
  reducers: {
    setSideBar: (state, action: PayloadAction<TSideBar[]>) => action.payload,
  },
});

export default sideBarSlice.reducer;
export const { setSideBar } = sideBarSlice.actions;
