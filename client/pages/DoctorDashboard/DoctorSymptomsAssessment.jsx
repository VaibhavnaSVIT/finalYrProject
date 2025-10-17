import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import DoctorHeader from "../../components/DoctorHeader.jsx";
import Disclaimer from "../../components/Disclaimer.jsx";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";

const COMMON_SYMPTOMS = [
  "muscle_pain",
  "family_history",
  "itching",
  "altered_sensorium",
  "chest_pain",
  "dark_urine",
  "mild_fever",
  "joint_pain",
  "mucoid_sputum",
  "yellowing_of_eyes",
  "stomach_pain",
  "sweating",
  "loss_of_appetite",
  "fatigue",
  "high_fever",
  "weight_loss",
  "rusty_sputum",
  "lack_of_concentration",
  "muscle_weakness",
  "vomiting",
  "diarrhoea",
  "red_spots_over_body",
  "headache",
  "chills",
  "nodal_skin_eruptions",
  "internal_itching",
  "unsteadiness",
  "passage_of_gases",
  "loss_of_balance",
  "nausea",
];

const DoctorSymptomsAssessment = () => {
  const [entry, setEntry] = useState({
    name: "",
    severity: "",
    duration: "",
    notes: "",
  });

  const [symptoms, setSymptoms] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const addQuickSymptom = (s) => {
    if (symptoms.find((x) => x.name === s)) {
      toast.info(`${s} already added`);
      return;
    }
    setSymptoms((prev) => [
      ...prev,
      { name: s, severity: "Mild", duration: "ongoing", notes: "" },
    ]);
  };

  const removeSymptom = (name) =>
    setSymptoms((prev) => prev.filter((s) => s.name !== name));

  const submitAssessment = async () => {
    if (symptoms.length < 7) {
      toast.error(
        "Please add minimum of 7 symptoms for better results from model."
      );
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const symptomNames = symptoms.map((s) => s.name);
      const res = await axios.post(
        "http://127.0.0.1:8000/doctor/symptom-assessment/",
        {
          symptoms: symptomNames,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Assessment submitted successfully.");
      setPredictions(res.data.model_prediction.top_predictions);
      setSymptoms([]);
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      toast.error(message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={4000} />
      <DoctorHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Symptom Assessment
          </h1>
          <p className="mt-2 text-gray-600">
            Enter patient symptoms and medical information for disease
            prediction.
          </p>
        </section>

        <div className="mt-6">
          <Disclaimer />
        </div>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MonitorHeartOutlinedIcon />
            <h2 className="text-lg font-semibold text-gray-900">
              Symptom Entry
            </h2>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              Quick Select Common Symptoms:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addQuickSymptom(s)}
                  className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {symptoms.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Added Symptoms
              </h3>
              <ul className="mt-2 divide-y divide-gray-200 rounded-md border">
                {symptoms.map((s) => (
                  <li
                    key={s.name}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {s.name}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {s.severity}
                      </span>
                      {s.duration && (
                        <span className="text-xs text-gray-500">
                          {s.duration}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeSymptom(s.name)}
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
              onClick={submitAssessment}
              className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Save Assessment
            </button>
          </div>
        </section>
        {predictions.length > 0 && (
          <section className="mt-8 rounded-xl border border-green-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
              Top 3 Model Predictions.
            </h2>

            {predictions[0].confidence < 20 && (
              <div className="mb-4 rounded bg-red-100 p-4 text-center text-red-700 font-semibold">
                The model's confidence is below 20%, not sure !
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 p-4 text-center bg-green-50"
                >
                  <h3 className="text-md font-semibold text-gray-800">
                    {idx + 1}. {pred.disease}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Confidence:{" "}
                    <span className="font-medium">{pred.confidence}%</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default DoctorSymptomsAssessment;
