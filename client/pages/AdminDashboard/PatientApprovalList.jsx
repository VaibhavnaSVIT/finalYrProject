import React, { useEffect, useState } from "react";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import { toast } from "react-toastify";

const PatientsDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/admin/api/patients/pending/"
        );
        if (!response.ok) throw new Error("Failed to fetch patients");
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleApprove = async (patientId) => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin/api/patients/approve/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: patientId }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Patient approved successfully");
        setPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
      } else {
        toast.error(data.error || "Failed to approve patient");
      }
    } catch (err) {
      toast.error("Something went wrong while approving patient");
    }
  };

  const handleReject = async (patientId) => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin/api/patients/reject/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: patientId }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Patient rejected and removed");
        setPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
      } else {
        toast.error(data.error || "Failed to reject patient");
      }
    } catch (err) {
      toast.error("Something went wrong while rejecting patient");
    }
  };

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (patients.length === 0) return <p>No pending patients found.</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Pending Patient Approvals
      </h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {patients.map((patient) => (
          <div
            key={patient._id}
            className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold mb-2">
                {patient.name || "N/A"}
              </h2>
              <p>
                <strong>Email:</strong> {patient.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {patient.phone || "N/A"}
              </p>
              <p>
                <strong>Gender:</strong>{" "}
                {patient.gender
                  ? patient.gender.charAt(0).toUpperCase() +
                    patient.gender.slice(1)
                  : "N/A"}
              </p>
              <p>
                <strong>Date of Birth:</strong> {patient.dob || "N/A"}
              </p>
              <p>
                <strong>Approval Status:</strong>{" "}
                <span className="capitalize">
                  {patient.admin_approval_status || "N/A"}
                </span>
              </p>
            </div>

            <div className="mt-6 flex justify-center space-x-6">
              <button
                title="Approve"
                className="text-green-600 hover:text-green-800 text-2xl font-bold"
                onClick={() => handleApprove(patient.patient_id)}
              >
                <DoneIcon />
              </button>
              <button
                title="Reject"
                className="text-red-600 hover:text-red-800 text-2xl font-bold"
                onClick={() => handleReject(patient.patient_id)}
              >
                <ClearIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsDashboard;
