"use client";

export const getAuthToken = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem("login-token")}`,
    // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzA0NTYwMTl9.NCC5Jo3AyoOlR6VP8WTZgnI2uyTBTq4EzO_1IaRF23Y`,
  };
};
