import React, { useEffect, useState } from "react";
import PatientHeader from "../../components/PatientHeader.jsx";
import axios from "axios";
import Disclaimer from "../../components/Disclaimer.jsx";
import { ToastContainer, toast } from "react-toastify";
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

const SymptomAssessmentPage = () => {
  const [entry, setEntry] = useState({
    name: "",
    severity: "",
    duration: "",
    notes: "",
  });

  const [symptoms, setSymptoms] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

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
        "http://127.0.0.1:8000/patient/symptom-assessment/",
        {
          symptoms: symptomNames,
          selected_doctor: selectedDoctor,
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
      <ToastContainer position="top-right" autoClose={4000} />
      <PatientHeader />

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
              Enter Symptoms from below list:
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

          <div className="mt-6">
            {symptoms.length > 0 && (
              <div className="mb-6">
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

            <div className="flex flex-wrap items-end justify-between gap-4">
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

              <div className="self-end">
                <button
                  onClick={submitAssessment}
                  className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Save Assessment
                </button>
              </div>
            </div>
          </div>
        </section>
        {predictions.length > 0 && (
          <section className="mt-8 rounded-xl border border-green-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
              Top 3 Model Predictions.
            </h2>

            {predictions[0].confidence < 20 && (
              <div className="mb-4 rounded bg-red-100 p-4 text-center text-red-700 font-semibold">
                The model's confidence is below 20%. Please consider consulting
                a doctor for further evaluation.
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

export default SymptomAssessmentPage;
