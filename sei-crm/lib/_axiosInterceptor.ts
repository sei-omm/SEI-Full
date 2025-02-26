import axios from "axios";

axios.interceptors.request.use((config) => {
  config.withCredentials = true; // Ensure cookies are sent with every request
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
          alert(
            "Unauthorized! redirecting to login..."
          );
        }

        // Abort all ongoing requests
        abortController.abort();

        // Create a new AbortController for future requests
        abortController = new AbortController();

        // Redirect user to login page (optional)
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        break;
    }
    return Promise.reject(error);
  }
);
