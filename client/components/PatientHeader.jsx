import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

const PatientHeader = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name:
      localStorage.getItem("user_name") ||
      localStorage.getItem("patient_name") ||
      "Patient",
    email: localStorage.getItem("user_email") || "",
  });

  const linkClasses = ({ isActive }) =>
    isActive
      ? "flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white"
      : "flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition";

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/patient-login");
        return;
      }
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/patient/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          setUser({
            name: response.data.name || user.name,
            email: response.data.email || user.email,
          });
          localStorage.setItem("user_name", response.data.name || user.name);
          localStorage.setItem("user_email", response.data.email || user.email);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    }
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("patient_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_avatar");
    navigate("/patient-login");
  };

  return (
    <header className="bg-white/90 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-900 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
              </svg>
            </span>
            <div className="leading-tight">
              <Link
                to="/patient-dashboard"
                className="block text-lg font-semibold text-gray-900"
              >
                MedDiagnose
              </Link>
            </div>
          </div>

          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            <NavLink to="/patient-dashboard" end className={linkClasses}>
              <HomeOutlinedIcon className="text-sm" />
              Home
            </NavLink>
            <NavLink to="/patient-dashboard/upload" className={linkClasses}>
              <FileUploadOutlinedIcon />
              Upload Image
            </NavLink>
            <NavLink to="/patient-dashboard/symptoms" className={linkClasses}>
              <DriveFileRenameOutlineOutlinedIcon />
              Symptoms
            </NavLink>
            <NavLink to="/patient-dashboard/results" className={linkClasses}>
              <CollectionsOutlinedIcon />
              Results
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold leading-tight text-gray-900">
                {user.name}
              </div>
              {user.email && (
                <div className="text-xs leading-tight text-gray-500">
                  {user.email}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
