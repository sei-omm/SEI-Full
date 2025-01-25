import { configureStore } from "@reduxjs/toolkit";
import dialogSlice from "./slice/dialog.slice";
import headerColorChangerSlice from "./slice/headerColorChanger.slice";
import profileImageSlice from "./slice/profileImage.slice";
import { courseCart } from "./slice/courseCart.slice";
import { loginStatusSlice } from "./slice/loginStatus";

export const store = configureStore({
  reducer: {
    dialog: dialogSlice,
    headerColorChanger: headerColorChangerSlice,
    profileImage: profileImageSlice,
    courseCart: courseCart,
    loginStatus: loginStatusSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
