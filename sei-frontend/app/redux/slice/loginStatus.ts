import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TInitialState = {
  status: "login" | "logout" | "null";
};
const initialState: TInitialState = {
  status: "null",
};

const loginStatus = createSlice({
  initialState,
  name: "isAuthenticated",
  reducers: {
    setLoginStatus: (state, action: PayloadAction<TInitialState>) => action.payload,
  },
});

export const loginStatusSlice = loginStatus.reducer;
export const { setLoginStatus } = loginStatus.actions;
