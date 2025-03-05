import { getCookie } from "@/app/actions/cookies";
import axios from "axios";
import { redirect } from "next/navigation";

axios.interceptors.request.use(async (config) => {
  config.withCredentials = true;

  // Check if running on the server
  if (typeof window === "undefined") {
    const token = await getCookie("refreshToken");

    if (token) {
      config.headers.Cookie = `refreshToken=${token}`;
    }
  }

  return config;
});

let abortController = new AbortController();

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response.status;
    switch (status) {
      case 401:
        if (typeof window !== "undefined") {
          // Only run alert on the client-side
          alert("Unauthorized! redirecting to login...");
        } else {
          redirect("/auth/login");
        }

        // Abort all ongoing requests
        abortController.abort();

        // Create a new AbortController for future requests
        abortController = new AbortController();

        // Redirect user to login page (optional)
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        } else {
          redirect("/auth/login");
        }
        break;
    }
    return Promise.reject(error);
  }
);
