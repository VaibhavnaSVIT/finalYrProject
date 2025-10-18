import React from "react";
import DoctorHeader from "../../components/DoctorHeader.jsx";
import Disclaimer from "../../components/Disclaimer.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorRequestsPage = () => {
  const [imageClassifications, setImageClassifications] = useState([]);
  const [symptomRequests, setSymptomRequests] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [loadingSubmit, setLoadingSubmit] = useState({});

  const handleRecommendationChange = (id, value) => {
    setRecommendations((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageSubmitRecommendation = async (id) => {
    const recommendation = recommendations[id];
    if (!recommendation || recommendation.trim() === "") {
      toast.error("Recommendation cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      setLoadingSubmit((prev) => ({ ...prev, [id]: true }));
      const res = await axios.post(
        "http://127.0.0.1:8000/doctor/submit-image-recommendation/",
        { patient_medical_img_id: id, recommendation },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Recommendation submitted successfully!");
    } catch (err) {
      console.error("Submission failed", err);
      toast.error("Failed to submit recommendation.");
    } finally {
      setLoadingSubmit((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSymptomSubmitRecommendation = async (id) => {
    const recommendation = recommendations[id];
    if (!recommendation || recommendation.trim() === "") {
      toast.error("Recommendation cannot be empty.");
      return;
    }
    try {
      console.log("id sent: ", id);
      const token = localStorage.getItem("access_token");
      setLoadingSubmit((prev) => ({ ...prev, [id]: true }));
      const res = await axios.post(
        "http://127.0.0.1:8000/doctor/submit-symptom-recommendation/",
        { patient_symptoms_id: id, recommendation },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status == 200)
        toast.success("Recommendation submitted successfully!");
    } catch (err) {
      console.error("Submission failed", err);
      toast.error("Failed to submit recommendation.");
    } finally {
      setLoadingSubmit((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://127.0.0.1:8000/doctor/get-image-requests/",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setImageClassifications(res.data.image_requests);
      } catch (err) {
        console.error("Error fetching image requests", err);
      }
    };
    fetchImageData();
  }, []);

  useEffect(() => {
    const fetchSymptomRequests = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://127.0.0.1:8000/doctor/get-symptom-requests/",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setSymptomRequests(res.data.assessments);
      } catch (err) {
        console.error("Error fetching symptom requests", err);
      }
    };
    fetchSymptomRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Patient Requests
        </h1>
        <div>
          <Disclaimer />
        </div>

        {imageClassifications.length === 0 ? (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <p>No requests yet.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Image based request
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Date Uploaded
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Image Uploaded
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Model Prediction
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Medication (Hardcoded)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Patient Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Doctor Recommendation
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {imageClassifications.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          {item.img_uploaded}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <a
                            href={`http://localhost:8000/media/patient_uploads/${item.file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {item.file_name}
                          </a>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.prediction} {item.confidence}%
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.hardcode_medication}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.patient_name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            rows="2"
                            value={
                              recommendations[item._id] ||
                              item.doctor_recommendation ||
                              ""
                            }
                            onChange={(e) =>
                              handleRecommendationChange(
                                item._id,
                                e.target.value
                              )
                            }
                            placeholder="Write recommendation..."
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() =>
                              handleImageSubmitRecommendation(item._id)
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loadingSubmit[item._id]}
                          >
                            {loadingSubmit[item._id]
                              ? "Submitting..."
                              : "Submit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Symptom Based Prediction Request
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Date Uploaded
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Symptoms
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Model Top 3 Predictions
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Medication (Hardcoded)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Patient Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Doctor Recommendation
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptomRequests.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          {item.submitted_at || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {Array.isArray(item.symptoms)
                            ? item.symptoms.join(", ")
                            : ""}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.top_predictions &&
                          Array.isArray(item.top_predictions)
                            ? item.top_predictions
                                .map(
                                  (pred) =>
                                    `${
                                      pred.disease
                                    } (${pred.confidence?.toFixed(2)}%)`
                                )
                                .join(", ")
                            : ""}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {typeof item.hardcode_medication === "string"
                            ? item.hardcode_medication
                            : Array.isArray(item.hardcode_medication)
                            ? item.hardcode_medication
                                .map((med) => `${med.name} (${med.purpose})`)
                                .join(", ")
                            : ""}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.patient_name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            rows="2"
                            value={
                              recommendations[item._id] ||
                              item.doctor_recommendation ||
                              ""
                            }
                            onChange={(e) =>
                              handleRecommendationChange(
                                item._id,
                                e.target.value
                              )
                            }
                            placeholder="Write recommendation..."
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() =>
                              handleSymptomSubmitRecommendation(item._id)
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loadingSubmit[item._id]}
                          >
                            {loadingSubmit[item._id]
                              ? "Submitting..."
                              : "Submit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorRequestsPage;
