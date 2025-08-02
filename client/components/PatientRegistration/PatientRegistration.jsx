import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientRegister = () => {
  const navigate = useNavigate();
  const savedData = JSON.parse(localStorage.getItem("patientForm")) || {
    name: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    password: "",
  };

  const [formData, setFormData] = useState(savedData);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(
    localStorage.getItem("isOtpSent") === "true"
  );

  useEffect(() => {
    localStorage.setItem("patientForm", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log("data changed");
  };

  const registerPatient = async (e) => {
    e.preventDefault();
    console.log("registering patient now");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/patient/register/",
        formData
      );
      console.log("tried register");
      console.log("Registration response: ", response.data);
      if (response.data?.message) {
        setIsOtpSent(true);
        localStorage.setItem("isOtpSent", "true");
      } else {
        toast.error("Unexpected response. Try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error.response?.data);
      toast.error(error.response?.data?.error || "Registration failed");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/patient/verify-otp/",
        {
          email: formData.email,
          otp,
        }
      );
      localStorage.removeItem("patientForm");
      localStorage.removeItem("isOtpSent");
      navigate("/patient-login");
    } catch (error) {
      toast.error(error.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-6">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl border">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 bg-red-400 text-white font-bold px-4 py-2 rounded-md hover:bg-red-500 transition"
        >
          Back
        </button>
        {!isOtpSent ? (
          <>
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Patient Registration
            </h2>
            <form onSubmit={registerPatient} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter your name"
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Enter your password"
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    placeholder="Enter your phone number"
                    required
                    pattern="[0-9]{10}"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onChange={(e) => {
                      if (/^\d{0,10}$/.test(e.target.value)) {
                        setFormData({ ...formData, phone: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold p-3 rounded-md hover:bg-blue-700 transition"
              >
                Register
              </button>
            </form>
            <p className="mt-4 text-center">
              Already have an account?{" "}
              <Link
                to="/patient-login"
                className="text-blue-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Verify OTP
            </h2>

            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  placeholder="Enter OTP"
                  required
                  pattern="[0-9]{6}"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                  onChange={(e) => {
                    if (/^\d{0,6}$/.test(e.target.value))
                      setOtp(e.target.value);
                  }}
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false);
                    localStorage.setItem("isOtpSent", "false");
                  }}
                  className="bg-gray-500 text-white font-bold p-2 rounded-md hover:bg-gray-600 transition"
                >
                  Change Data
                </button>

                <button
                  type="submit"
                  className="bg-green-500 text-white font-bold p-2 rounded-md hover:bg-green-600 transition"
                >
                  Verify OTP
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientRegister;
