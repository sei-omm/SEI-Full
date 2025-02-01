import Link from "next/link";

import React from "react";

export default function page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-2xl p-12 mx-4 text-center transition-all transform bg-white shadow-lg rounded-xl hover:shadow-xl">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-8 bg-green-100 rounded-full">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <h1 className="mb-6 text-4xl font-bold text-green-600">
          Payment Successful!
        </h1>

        <p className="mb-8 text-xl text-gray-700">Thank you for pay.</p>

        <div className="pt-8 mt-8 border-t border-gray-100">
          <p className="text-lg text-gray-700">
            Have questions? Contact us at:
          </p>
          <Link
            href="mailto:booking@seiedutrust.com"
            className="inline-block mt-2 text-xl font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800"
          >
            booking@seiedutrust.com
          </Link>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-block px-8 py-4 text-lg font-semibold text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
