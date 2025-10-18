import React, { useState } from "react";
import axios from "axios";
import DropArea from "../../components/DropArea";
import DoctorHeader from "../../components/DoctorHeader.jsx";
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

const DoctorUploadImage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [domain, setDomain] = useState("");
  const [domainSpecific, setDomainSpecific] = useState("");

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
    if (valid.length) setFile(valid[0]);
  };

  const removeFile = () => {
    setFile(null);
    setPredictionResult(null);
    setIsIncorrect(false);
    setDomain("");
    setDomainSpecific("");
  };

  const handleDoctorImgUpload = async () => {
    if (!file) {
      toast.info("Please select an image.");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const form = new FormData();
      form.append("images", file);

      const res = await axios.post(
        "http://127.0.0.1:8000/doctor/upload-images/",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPredictionResult(res.data);
      toast.success("Upload successful.");
    } catch (err) {
      const backendError =
        err.response?.data?.error || "Upload failed. Please try again.";
      toast.error(backendError);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!domain || !domainSpecific) {
      toast.error("Please select both domain and domain-specific type.");
      return;
    }
    if (!file) {
      toast.error("No file to send as feedback.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("domain", domain);
      formData.append("domain_specific", domainSpecific);

      await axios.post(
        "http://127.0.0.1:8000/doctor/wrong-image-feedback/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Feedback submitted.");
      removeFile();
    } catch (err) {
      toast.error("Error submitting feedback.");
      console.error(err);
    }
  };

  const domainSpecificOptions = {
    skin_diseases: ["benign_keratosis_like_lesions", "eczema"],
    oral_disorder: ["hypodontia", "mouth_ulcer"],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />
      <DoctorHeader />
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
          <Disclaimer />
        </div>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Medical Images
          </h2>
          <p className="mt-1 text-gray-700">
            Doctors can flag predictions as incorrect. After 50 incorrect
            feedbacks, the model is retrained.
          </p>

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

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDoctorImgUpload}
              disabled={uploading}
              className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {predictionResult && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-md font-bold text-gray-800 mb-4">
                Model Prediction Breakdown
              </h3>

              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-semibold">General Domain:</span>{" "}
                  {predictionResult.domain} (
                  {predictionResult.domain_confidence}%)
                </p>
                <p>
                  <span className="font-semibold">Specific Prediction:</span>{" "}
                  {predictionResult.prediction} ({predictionResult.confidence}%)
                </p>
              </div>

              {(predictionResult.domain_confidence < 85 ||
                predictionResult.confidence < 85) && (
                <p className="mt-4 rounded bg-red-100 border border-red-400 px-4 py-2 text-red-700 font-semibold">
                  Model's confidence is less than 85%, requires doctor's input.
                </p>
              )}

              {!isIncorrect ? (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => {
                      toast.success("Marked as correct.");
                      window.location.reload();
                    }}
                    className="rounded-full bg-green-600 px-4 py-2 text-white text-sm hover:bg-green-500"
                  >
                    ✅ Correct
                  </button>
                  <button
                    onClick={() => setIsIncorrect(true)}
                    className="rounded-full bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-500"
                  >
                    ❌ Incorrect
                  </button>
                </div>
              ) : (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700">
                    Mark Correction
                  </h4>

                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      General Domain
                    </label>
                    <select
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        setDomainSpecific("");
                      }}
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="">-- Select Domain --</option>
                      <option value="skin_diseases">Skin Diseases</option>
                      <option value="oral_disorder">Oral Disorder</option>
                    </select>
                  </div>

                  {domain && (
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 mb-1">
                        Domain Specific
                      </label>
                      <select
                        value={domainSpecific}
                        onChange={(e) => setDomainSpecific(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                      >
                        <option value="">-- Select Specific --</option>
                        {domainSpecificOptions[domain]?.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleFeedbackSubmit}
                    className="mt-4 inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DoctorUploadImage;
