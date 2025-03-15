import { configureStore } from "@reduxjs/toolkit";
import dialogsSlice from "./slices/dialogs.slice";
import sideBarSlice from "./slices/sidebar.slice";

export const store = configureStore({
  reducer: {
    dialogs: dialogsSlice,
    sidebar: sideBarSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
