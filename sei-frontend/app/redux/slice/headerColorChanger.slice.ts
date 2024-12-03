import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInitialState {
  logoColor: "white" | "black";
  textColor: "white" | "black";
}

const initialState: IInitialState = {
  logoColor: "white",
  textColor: "white",
};

const headerColorChanger = createSlice({
  initialState,
  name: "Header Color Changer",
  reducers: {
    setHeaderColor: (state, action: PayloadAction<IInitialState>) =>
      action.payload,
  },
});

export default headerColorChanger.reducer;
export const { setHeaderColor } = headerColorChanger.actions;
