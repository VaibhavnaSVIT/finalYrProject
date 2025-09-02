import React, { useEffect, useState } from "react";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const DoctorApprovalList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/admin/api/doctors/pending/"
        );
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        console.log("data: ", data);
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const mediaBaseURL = "http://localhost:8000/media/";

  const handleApprove = async (doctorId) => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin/api/doctors/approve/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ doctor_id: doctorId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Doctor approved successfully");
        setDoctors((prev) => prev.filter((doc) => doc.doctor_id !== doctorId));
      } else {
        toast.error(data.error || "Failed to approve doctor");
      }
    } catch (err) {
      toast.error("Something went wrong while approving");
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin/api/doctors/reject/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ doctor_id: doctorId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Doctor rejected and removed");
        setDoctors((prev) => prev.filter((doc) => doc.doctor_id !== doctorId));
      } else {
        toast.error(data.error || "Failed to reject doctor");
      }
    } catch (err) {
      toast.error("Something went wrong while rejecting");
    }
  };

  if (loading) return <p>Loading doctors...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (doctors.length === 0) return <p>No pending doctors found.</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Pending Doctor Approvals
        </h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {doctors.map((doc) => (
            <div
              key={doc.doctor_id}
              className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {doc.personal_info?.fullName || "N/A"}
                </h2>
                <p>
                  <strong>Email:</strong> {doc.personal_info?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {doc.personal_info?.phone || "N/A"}
                </p>
                <p>
                  <strong>Gender:</strong>{" "}
                  {doc.personal_info?.gender?.charAt(0).toUpperCase() +
                    doc.personal_info?.gender?.slice(1) || "N/A"}
                </p>
                <p>
                  <strong>DOB:</strong> {doc.personal_info?.dob || "N/A"}
                </p>
              </div>

              <div className="mt-4">
                <p>
                  <strong>Specialization:</strong>{" "}
                  {doc.professional_info?.specialization || "N/A"}
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {doc.professional_info?.experience
                    ? `${doc.professional_info.experience} years`
                    : "N/A"}
                </p>
              </div>

              <div className="mt-4">
                <strong>Education:</strong>
                {doc.professional_info?.education?.length ? (
                  <ul className="list-disc list-inside">
                    {doc.professional_info.education.map((edu, idx) => (
                      <li key={idx}>
                        {edu.degree}, {edu.university} ({edu.year_of_completion}
                        )
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>N/A</p>
                )}
              </div>

              <div className="mt-4">
                <strong>Hospital Affiliations:</strong>
                {doc.professional_info?.hospitalAffiliations?.length &&
                doc.professional_info.hospitalAffiliations.some(
                  (h) => h.trim() !== ""
                ) ? (
                  <ul className="list-disc list-inside">
                    {doc.professional_info.hospitalAffiliations.map(
                      (hospital, idx) =>
                        hospital.trim() !== "" && <li key={idx}>{hospital}</li>
                    )}
                  </ul>
                ) : (
                  <p>N/A</p>
                )}
              </div>

              <div className="mt-4">
                <p>
                  <strong>Medical License No.:</strong>{" "}
                  {doc.verification_info?.medicalLicense_no || "N/A"}
                </p>
                <p>
                  <strong>Admin Approval Status:</strong>{" "}
                  <span className="capitalize">
                    {doc.verification_info?.admin_approval_status || "N/A"}
                  </span>
                </p>
              </div>

              <div className="mt-4">
                <strong>Documents:</strong>
                <div className="flex flex-col space-y-1">
                  {doc.verification_info?.documents?.degree_certificate ? (
                    <a
                      href={`${mediaBaseURL}${doc.verification_info.documents.degree_certificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Degree Certificate
                    </a>
                  ) : (
                    <p>Degree Certificate: N/A</p>
                  )}
                  {doc.verification_info?.documents?.medical_license ? (
                    <a
                      href={`${mediaBaseURL}${doc.verification_info.documents.medical_license}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Medical License
                    </a>
                  ) : (
                    <p>Medical License: N/A</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-6">
                <button
                  title="Approve"
                  className="text-green-600 hover:text-green-800 text-2xl font-bold"
                  onClick={() => handleApprove(doc.doctor_id)}
                >
                  <DoneIcon />
                </button>
                <button
                  title="Reject"
                  className="text-red-600 hover:text-red-800 text-2xl font-bold"
                  onClick={() => handleReject(doc.doctor_id)}
                >
                  <ClearIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DoctorApprovalList;
