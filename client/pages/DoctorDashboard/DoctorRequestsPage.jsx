import React from "react";
import DoctorHeader from "../../components/DoctorHeader.jsx";
import Disclaimer from "../../components/Disclaimer.jsx";
import { useEffect, useState } from "react";

const DoctorRequestsPage = () => {
  const mediaBaseURL = "http://localhost:8000/media/";
  const [imageClassifications, setImageClassifications] = useState([]);
  const [symptomPrediction, setSymptomPrediction] = useState([]);
  const [recommendations, setRecommendations] = useState({});

  const handleRecommendationChange = (id, value) => {
    setRecommendations((prev) => ({ ...prev, [id]: value }));
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
        setImageClassifications(res.data.classifications);
      } catch (err) {
        console.error("Error fetching classifications", err);
      }
    };
    fetchImageData();
  }, []);

  useEffect(() => {
    const fetchSymptomData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://127.0.0.1:8000/doctor/symptom-prediction-request/",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setSymptomPrediction(res.data.assessments);
      } catch (err) {
        console.error("Error fetching classifications", err);
      }
    };
    fetchSymptomData();
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

        {imageClassifications.length === 0 &&
        setSymptomPrediction.length === 0 ? (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <ReportProblemOutlinedIcon className="text-gray-700" />
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
                        Doctor Recommended Medication
                      </th>
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
                          <div className="flex gap-2 items-start">
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
                            <button
                              onClick={() =>
                                submitRecommendation(item._id, "image")
                              }
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Submit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h2 className="mt-20 text-xl font-semibold text-gray-800 mb-4">
                Symptom based disease prediction
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Date Submitted
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Symptoms Uploaded
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Top 3 Model Prediction
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Medication (Hardcoded) for Top prediction
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Patient Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Doctor Recommended Medication
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptomPrediction.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          {item.submitted_at}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.symptoms?.join(", ") || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.top_predictions?.map((pred, i) => (
                            <div key={i}>
                              {pred.disease} - {pred.confidence}%
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {Array.isArray(item.hardcode_medication)
                            ? item.hardcode_medication.map((med, i) => (
                                <div key={i}>
                                  <strong>{med.name}</strong>: {med.purpose}
                                </div>
                              ))
                            : item.hardcode_medication || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.doctor_name || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex gap-2 items-start">
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
                            <button
                              onClick={() =>
                                submitRecommendation(item._id, "symptom")
                              }
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Submit
                            </button>
                          </div>
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
