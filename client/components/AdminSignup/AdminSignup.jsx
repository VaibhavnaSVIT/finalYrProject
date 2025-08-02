import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/admin/api/signup/",
        formData
      );

      if (response.data.message) {
        toast.success("OTP sent successfully!");
        setStep(2);
      }
    } catch (error) {
      console.error("Send OTP Error:", error.response?.data);
      toast.error(error.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/admin/api/verify-otp/",
        {
          email: formData.email,
          otp,
        }
      );

      toast.success("Admin registered successfully!");
      navigate("/admin-login");
    } catch (error) {
      console.error("Verify OTP Error:", error.response?.data);
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

        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Admin Signup
            </h2>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold p-2 rounded-md hover:bg-blue-700 transition"
              >
                Send OTP
              </button>
              <p className="mt-4 text-center">
                Don't have an account?{" "}
                <Link
                  to="/admin-login"
                  className="text-blue-600 hover:underline"
                >
                  Admin Login in
                </Link>
              </p>
            </form>
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
                Verify OTP & Register
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSignup;
