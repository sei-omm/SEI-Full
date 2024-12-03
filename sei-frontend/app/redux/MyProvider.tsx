"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DoTaskOnInitilize from "../components/DoTaskOnInitilize";
import { QueryClient, QueryClientProvider } from "react-query";
import CourseCart from "../components/CourseCart";

interface IProps {
  children: React.ReactNode;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

export default function MyProvider({ children }: IProps) {
  return (
    <Provider store={store}>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <QueryClientProvider client={queryClient}>
        {/* Course Cart */}
        <CourseCart />
        {children}
      </QueryClientProvider>
      <DoTaskOnInitilize />
    </Provider>
  );
}
