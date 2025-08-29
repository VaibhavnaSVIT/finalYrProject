import React, { useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const displayName = useMemo(
    () =>
      localStorage.getItem("user_name") ||
      localStorage.getItem("patient_name") ||
      "Patient",
    []
  );
  const email = useMemo(() => localStorage.getItem("user_email") || "", []);

  const linkClasses = ({ isActive }) =>
    isActive
      ? "flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white"
      : "flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition";

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
                MedDiagnose AI
              </Link>
              <p className="text-xs text-gray-500">Advanced Medical Analysis</p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            <NavLink to="/patient-dashboard" end className={linkClasses}>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Home
            </NavLink>
            <NavLink to="/patient-dashboard/upload" className={linkClasses}>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12V3m0 0l-4 4m4-4l4 4" />
              </svg>
              Upload Image
            </NavLink>
            <NavLink to="/patient-dashboard/symptoms" className={linkClasses}>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Symptoms
            </NavLink>
            <NavLink to="/patient-dashboard/results" className={linkClasses}>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 3h18v18H3V3z" />
                <path d="M8 17l2-3 2 2 3-4 3 5" />
              </svg>
              Results
            </NavLink>
            <NavLink to="/patient-dashboard/history" className={linkClasses}>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold leading-tight text-gray-900">
                {displayName}
              </div>
              {email && (
                <div className="text-xs leading-tight text-gray-500">
                  {email}
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

export default Header;
