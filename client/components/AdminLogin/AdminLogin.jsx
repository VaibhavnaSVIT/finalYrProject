import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/admin/api/login/",
        {
          email,
          password,
        }
      );
      console.log("Admin Login Response:", response.data);

      const token = response.data.tokens?.access;

      if (token) {
        localStorage.setItem("adminToken", token);
        navigate("/admin-dashboard");
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (error) {
      console.error("Admin Login Error:", error.response?.data);
      toast.error(error.response?.data?.error || "Login failed");
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

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Login
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
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/admin-signup" className="text-blue-600 hover:underline">
              Admin Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
