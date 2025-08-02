import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/patient/login/",
        {
          email,
          password,
        }
      );
      console.log("Login Response:", response.data);

      if (response.data.message) {
        setIsOtpSent(true);
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/patient/verify-login-otp/",
        {
          email,
          otp,
        }
      );
      console.log("OTP Verification Response:", response.data);
      const token = response.data.tokens?.access;

      console.log("token: ", token);

      if (token) {
        console.log("Token saved after OTP:", token);
        navigate("/patient-dashboard");
      } else {
        console.error("Token missing after OTP verification");
        toast.error(
          "OTP verification failed: No token received from handleVerifyOTP"
        );
      }
    } catch (error) {
      console.error("OTP Error:", error.response?.data);
      toast.error(error.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 bg-red-400 text-white font-bold px-4 py-2 rounded-md hover:bg-red-500 transition"
        >
          Back
        </button>

        {!isOtpSent ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Patient Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold p-2 rounded-md hover:bg-blue-700 transition"
              >
                Login
              </button>
            </form>
            <p className="mt-4 text-center">
              Don't have an account?{" "}
              <Link
                to="/patient-register"
                className="text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Verify OTP
            </h2>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    if (/^\d{0,6}$/.test(e.target.value))
                      setOtp(e.target.value);
                  }}
                  placeholder="Enter OTP"
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white font-bold p-2 rounded-md hover:bg-green-600 transition"
              >
                Verify OTP
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientLogin;
