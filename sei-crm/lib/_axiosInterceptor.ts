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

    // Abort all ongoing requests
    abortController.abort();

    // Create a new AbortController for future requests
    abortController = new AbortController();

    if (typeof window !== "undefined") {
      if (status === 401) {
        // Only run alert on the client-side
        alert("Unauthorized! redirecting to login...");
        window.location.href = "/auth/login";
      } else if (status === 403) {
        alert(
          "You Are Not Authorized to Access This Module. Contact Your Admin to Get Access."
        );
        window.location.href = `/error?status=${status}`;
      }
    } else {
      redirect(`/error?status=${status}`);
    }
    return Promise.reject(error);
  }
);
