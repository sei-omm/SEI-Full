import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInitialState {
  image : string | null
}

const initialState: IInitialState = {
  image : ""
};


const profileImage = createSlice({
  initialState,
  name: "Profile Image",
  reducers: {
    setProfileImage: (state, action : PayloadAction<IInitialState>) => action.payload,
  },
});

export default profileImage.reducer;
export const { setProfileImage } = profileImage.actions;
