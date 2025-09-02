import React, { useState } from "react";
import PatientApprovalList from "../AdminDashboard/PatientApprovalList.jsx";
import DoctorApprovalList from "../AdminDashboard/DoctorApprovalList.jsx";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("patients");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("patients")}
          className={`px-4 py-2 rounded ${
            activeTab === "patients"
              ? "bg-blue-600 text-white"
              : "bg-white border border-blue-600 text-blue-600"
          }`}
        >
          Patients
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          className={`px-4 py-2 rounded ${
            activeTab === "doctors"
              ? "bg-blue-600 text-white"
              : "bg-white border border-blue-600 text-blue-600"
          }`}
        >
          Doctors
        </button>
      </div>

      {activeTab === "patients" && <PatientApprovalList />}
      {activeTab === "doctors" && <DoctorApprovalList />}
    </div>
  );
};

export default AdminDashboard;
