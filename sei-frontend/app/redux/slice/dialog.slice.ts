import { DialogSliceType } from "@/app/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: DialogSliceType = {
  type: "CLOSE",
  dialogKey: "",
};

const dialogSlice = createSlice({
  initialState,
  name: "Dialog Slice",
  reducers: {
    setDialog: (state, action: PayloadAction<DialogSliceType>) =>
      action.payload,
  },
});

export default dialogSlice.reducer;
export const { setDialog } = dialogSlice.actions;
