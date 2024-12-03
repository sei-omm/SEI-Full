import { TCourseCart } from "@/app/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: TCourseCart[] = [];

const courseCartSlice = createSlice({
  initialState,
  name: "Course Cart Slice",
  reducers: {
    pushCourseToCart: (state, actions: PayloadAction<TCourseCart>) => {
      state.push(actions.payload);
      // localStorage.setItem("cart-date", JSON.stringify(state));
    },
    deleteCourseFromCart: (state, actions: PayloadAction<number>) => {
      state.splice(actions.payload, 1);
      // localStorage.setItem("cart-date", JSON.stringify(state));
    },
    updateCourseCart: (
      state,
      action: PayloadAction<{ index: number; values: TCourseCart }>
    ) => {
      state[action.payload.index] = action.payload.values;
      // localStorage.setItem("cart-date", JSON.stringify(state));
    },
    setCourseCart: (state, actions: PayloadAction<TCourseCart[]>) => {
      state = actions.payload;
    },
    clearCourseCart: (state) => {
      state.length = 0;
    },
  },
});

export const courseCart = courseCartSlice.reducer;
export const {
  pushCourseToCart,
  deleteCourseFromCart,
  updateCourseCart,
  setCourseCart,
  clearCourseCart
} = courseCartSlice.actions;
