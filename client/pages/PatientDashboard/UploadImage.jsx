import React, { useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import DropArea from "../../components/DropArea";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleUpload = async () => {
    if (!files.length) {
      toast.info("Please select at least one file.");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const form = new FormData();
      files.forEach((f) => form.append("images", f));
      const res = await axios.post(
        "http://127.0.0.1:8000/patient/upload-images/",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (e) => {
            if (e.total) {
              const pct = Math.round((e.loaded / e.total) * 100);
              // Optionally show progress UI
            }
          },
        }
      );
      toast.success("Upload successful.");
      setFiles([]);
      // Optionally navigate or store response
      console.log(res.data);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={5000} />
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Medical Image Upload
          </h1>
          <p className="mt-2 text-gray-600">
            Upload medical images for AI-powered analysis and diagnosis
            assistance
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
        </div>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Medical Images
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Supported formats: JPEG, PNG, DICOM. Each image will be processed by
            our CNN models.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-black">
              <b>X-Ray</b>
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-black">
              <b>CT Scan</b>
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-black">
              <b>MRI</b>
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-black">
              <b>Ultrasound</b>
            </span>
          </div>
          <div className="mt-6">
            <DropArea onFiles={handleAddFiles} />
          </div>
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Files ready to upload
              </h3>
              <ul className="mt-2 divide-y divide-gray-200 rounded-md border">
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      onClick={() => removeFile(f.name)}
                      className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UploadPage;
