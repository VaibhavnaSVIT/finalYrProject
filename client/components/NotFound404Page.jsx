import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound404Page = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 text-center max-w-md mt-2">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default NotFound404Page;
