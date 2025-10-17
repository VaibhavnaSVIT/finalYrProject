import React, { useState, useEffect } from "react";
import PatientHeader from "../../components/PatientHeader.jsx";
import { Link } from "react-router-dom";
import axios from "axios";
import Disclaimer from "../../components/Disclaimer.jsx";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

const ResultsPage = () => {
  const [imageClassifications, setImageClassifications] = useState([]);
  const [symptomPrediction, setSymptomPrediction] = useState([]);

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://127.0.0.1:8000/patient/image-classification-result/",
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
          "http://127.0.0.1:8000/patient/symptom-prediction-result/",
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
      <PatientHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Results</h1>
          <p className="mt-2 text-gray-600">Review previous input data.</p>
        </section>
        <div className="mt-6">
          <Disclaimer />
        </div>

        {imageClassifications.length === 0 ? (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <ReportProblemOutlinedIcon className="text-gray-700" />
                <p>
                  No analysis results found. Please upload images or enter
                  symptoms first.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/patient-dashboard/upload"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Upload Images
              </Link>
              <Link
                to="/patient-dashboard/symptoms"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Enter Symptoms
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Image Classification
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
                        Doctor Name
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
                        <td className="px-4 py-2 text-sm">{item.file_name}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.prediction} {item.confidence}%
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.hardcode_medication}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.doctor_name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.doctor_recommendation || "Pending"}
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
                        Doctor Name
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
                          {item.doctor_recommendation || "Pending"}
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

export default ResultsPage;
