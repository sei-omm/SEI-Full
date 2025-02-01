import React from "react";

export default function page() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Failed!
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Please check your payment details
          and try again.
        </p>

        <div className="mb-8 text-sm text-gray-600">
          <p>Have questions? Contact us at:</p>
          <p className="font-medium">booking@seiedutrust.com</p>
        </div>

        <a
          href="/"
          className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Return to Home
        </a>

        {/* <div className="mt-8 text-xs text-gray-400">
          <p>Activate Windows</p>
          <p>Go to Settings to activate Windows.</p>
        </div> */}
      </div>
    </div>
  );
}
