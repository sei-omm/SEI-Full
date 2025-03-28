import { configureStore } from "@reduxjs/toolkit";
import dialogsSlice from "./slices/dialogs.slice";
import sideBarSlice from "./slices/sidebar.slice";
import campusSlice from "./slices/campus.slice";

export const store = configureStore({
  reducer: {
    dialogs: dialogsSlice,
    sidebar: sideBarSlice,
    campus : campusSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
