import React, { useState } from "react";
import Header from "../../components/Header";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const COMMON_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Fatigue",
  "Nausea",
  "Chest Pain",
  "Shortness of Breath",
  "Dizziness",
  "Joint Pain",
  "Abdominal Pain",
  "Skin Rash",
  "Sore Throat",
  "Muscle Pain",
  "Back Pain",
  "Weight Loss",
  "Night Sweats",
  "Loss of Appetite",
  "Confusion",
  "Vomiting",
  "Diarrhea",
];

const severities = ["Mild", "Moderate", "Severe", "Critical"];
const genders = ["Male", "Female"];

const SymptomAssessmentPage = () => {
  const [patient, setPatient] = useState({
    age: "",
    gender: "",
    history: "",
    medications: "",
    allergies: "",
  });

  const [entry, setEntry] = useState({
    name: "",
    severity: "",
    duration: "",
    notes: "",
  });

  const [symptoms, setSymptoms] = useState([]);

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

  const addSymptom = () => {
    if (!entry.name.trim() || !entry.severity) {
      toast.error("Symptom name and severity are required.");
      return;
    }
    if (
      symptoms.find(
        (s) => s.name.toLowerCase() === entry.name.trim().toLowerCase()
      )
    ) {
      toast.info("This symptom is already in the list.");
      return;
    }
    setSymptoms((prev) => [...prev, { ...entry, name: entry.name.trim() }]);
    setEntry({ name: "", severity: "", duration: "", notes: "" });
  };

  const removeSymptom = (name) =>
    setSymptoms((prev) => prev.filter((s) => s.name !== name));

  const submitAssessment = async () => {
    if (!symptoms.length) {
      toast.error("Please add at least one symptom.");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        "http://127.0.0.1:8000/patient/symptom-assessment/",
        {
          patient,
          symptoms,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Assessment submitted successfully.");
      console.log(res.data);
      setSymptoms([]);
      setPatient({
        age: "",
        gender: "",
        history: "",
        medications: "",
        allergies: "",
      });
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
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Symptom Assessment
          </h1>
          <p className="mt-2 text-gray-600">
            Enter patient symptoms and medical information for AI-powered
            clinical analysis
          </p>
        </section>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This assessment uses advanced NLP and machine learning models for
          symptom analysis. Results should be reviewed by qualified medical
          professionals.
        </div>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gray-900 text-white">
              i
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              Patient Information
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Demographic and medical history data improves diagnostic accuracy
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                min="0"
                placeholder="Patient age"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={patient.age}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, age: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={patient.gender}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, gender: e.target.value }))
                }
              >
                <option value="">Select gender</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Medical History
              </label>
              <input
                type="text"
                placeholder="Previous diagnoses, surgeries, chronic conditions..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={patient.history}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, history: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Medications
              </label>
              <input
                type="text"
                placeholder="Medication names (comma-separated)"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={patient.medications}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, medications: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Known Allergies
              </label>
              <input
                type="text"
                placeholder="Drug/food allergies (comma-separated)"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={patient.allergies}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, allergies: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-md bg-gray-900 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              Symptom Entry
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Our NLP models process symptom descriptions for accurate clinical
            correlation
          </p>

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

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Symptom Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter symptom name"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={entry.name}
                onChange={(e) =>
                  setEntry((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={entry.severity}
                onChange={(e) =>
                  setEntry((prev) => ({ ...prev, severity: e.target.value }))
                }
              >
                <option value="">Select severity</option>
                {severities.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g., 3 days, 2 weeks, ongoing"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={entry.duration}
                onChange={(e) =>
                  setEntry((prev) => ({ ...prev, duration: e.target.value }))
                }
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addSymptom}
                className="inline-flex w-full items-center justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                + Add Symptom
              </button>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Description
              </label>
              <textarea
                rows={3}
                placeholder="Detailed description, triggers, associated symptoms..."
                className="mt-1 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-gray-900/10 focus:ring-2"
                value={entry.notes}
                onChange={(e) =>
                  setEntry((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
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
      </main>
    </div>
  );
};

export default SymptomAssessmentPage;
