import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientHeader from "../../components/PatientHeader.jsx";
import DropArea from "../../components/DropArea";
import { ToastContainer, toast } from "react-toastify";
import Disclaimer from "../../components/Disclaimer.jsx";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "application/dicom",
  "application/dicom+json",
  "application/dicom+xml",
  "application/octet-stream",
];

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const validateFiles = (incoming) => {
    const accepted = [];
    for (const f of incoming) {
      if (f.size > MAX_SIZE) {
        toast.error(`"${f.name}" exceeds 10MB.`);
        continue;
      }
      if (!ALLOWED.includes(f.type) && !f.name.toLowerCase().endsWith(".dcm")) {
        toast.error(`"${f.name}" type not allowed.`);
        continue;
      }
      accepted.push(f);
    }
    return accepted;
  };

  const handleAddFiles = (incoming) => {
    const valid = validateFiles(incoming);
    if (valid.length) {
      setFile(valid[0]);
      setPredictions(null);
    }
  };
  const removeFile = () => {
    setFile(null);
    setPredictions(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.info("Please select an image.");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const form = new FormData();
      form.append("images", file);
      if (selectedDoctor) {
        form.append("selected_doctor", selectedDoctor);
      }
      const res = await axios.post(
        "http://127.0.0.1:8000/patient/upload-images/",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      toast.success("Upload successful.");
      setPredictions(res.data);
      setFile(null);
    } catch (err) {
      const backendError =
        err.response?.data?.error || "Upload failed. Please try again.";
      toast.error(backendError);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://127.0.0.1:8000/patient/list-doctors/",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setDoctors(res.data.doctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        toast.error("Could not load doctor list.");
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />
      <PatientHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Medical Image Upload
          </h1>
          <p className="mt-2 text-gray-600">
            Model predicts images of skin diseases and oral disorders.
          </p>
        </section>
        <div className="mt-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Ensure images are clear, properly oriented, and contain no patient
              identifying information before uploading. Maximum file size: 10MB
              per image.
            </p>
          </div>
          <div className="mt-6">
            <Disclaimer />
          </div>
        </div>
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Medical Images (Skin disease, Oral disorders)
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Supported formats: JPEG, PNG, WEBP, JPG.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-black">
              Skin diseases includes eczema or bening keratosis like lesions.
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-black">
              Oral disorders includes hypodontis or mouth ulcers.
            </span>
          </div>
          <div className="mt-6">
            <DropArea onFiles={handleAddFiles} />
          </div>
          {file && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                File ready to upload
              </h3>
              <ul className="mt-2 divide-y divide-gray-200 rounded-md border">
                <li
                  key={file.name}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={removeFile}
                    className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Remove
                  </button>
                </li>
              </ul>
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              {doctors.length > 0 && (
                <div>
                  <label
                    htmlFor="doctor"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Choose a doctor to send the results:
                  </label>
                  <select
                    id="doctor"
                    name="doctor"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                  >
                    <option value="">-- Select a Doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>
                        {doc.personal_info?.fullName || "Unnamed Doctor"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </section>
        {predictions && (
          <section className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-900">
              Prediction Result
            </h2>

            {(parseFloat(
              predictions.domain_classification.confidence.replace("%", "")
            ) < 85 ||
              parseFloat(
                predictions.final_prediction.confidence.replace("%", "")
              ) < 85) && (
              <div className="mt-4 rounded-md bg-red-100 p-4 text-sm text-red-800 border border-red-300">
                ⚠️ The model's confidence is below 85%. Please consider
                consulting a doctor for further evaluation.
              </div>
            )}

            <div className="mt-4 text-sm text-green-800">
              <p>
                <strong>Predicted Domain:</strong>{" "}
                {predictions.domain_classification.predicted_domain}
              </p>
              <p>
                <strong>Domain Confidence:</strong>{" "}
                {predictions.domain_classification.confidence}
              </p>
              <p className="mt-3">
                <strong>Final Label:</strong>{" "}
                {predictions.final_prediction.label}
              </p>
              <p>
                <strong>Prediction Confidence:</strong>{" "}
                {predictions.final_prediction.confidence}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
export default UploadPage;
