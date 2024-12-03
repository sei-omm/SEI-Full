import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInitialState {
  type: "OPEN" | "CLOSE";
  dialogId: string | null;
  extraValue?: any;
}

const initialState: IInitialState = {
  type: "CLOSE",
  dialogId: null,
};

const dialogsSlice = createSlice({
  initialState,
  name: "OpenDialogSlice",
  reducers: {
    setDialog: (state, action: PayloadAction<IInitialState>) => action.payload,
  },
});

export default dialogsSlice.reducer;
export const { setDialog } = dialogsSlice.actions;
