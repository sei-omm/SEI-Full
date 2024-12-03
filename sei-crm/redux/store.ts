import { configureStore } from "@reduxjs/toolkit";
import dialogsSlice from "./slices/dialogs.slice";

export const store = configureStore({
  reducer: {
    dialogs : dialogsSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;