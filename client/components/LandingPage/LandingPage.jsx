import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome to Medical Platform
      </h1>
      <div className="flex space-x-8">
        <Link
          to="/patient-login"
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300"
        >
          Patient
        </Link>
        <Link
          to="/doctor-login"
          className="px-8 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors duration-300"
        >
          Doctor
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
