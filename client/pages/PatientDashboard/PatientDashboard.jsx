import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PatientHeader from "../../components/PatientHeader.jsx";
import Disclaimer from "../../components/Disclaimer.jsx";
import FeatureCard from "../../components/FeatureCard.jsx";

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/patient-login");
          return;
        }
        const response = await axios.get(
          "http://127.0.0.1:8000/patient/dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/patient-login");
        } else {
          setError("Failed to fetch dashboard data. Please try again.");
          toast.error("Failed to fetch dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-gray-700">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={2000} />
      <PatientHeader />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Patient Medical Diagnosis
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base text-gray-600">
            Deep Learning techniques for medical image analysis and Machine
            Learning techniques for symptom based disease prediction.
          </p>
        </section>

        <div className="mt-8">
          <Disclaimer />
        </div>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Medical Image Upload"
            description="Upload images of skin diseases or oral disorders."
            cta="Upload Images"
            onClick={() => navigate("/patient-dashboard/upload")}
          />
          <FeatureCard
            title="Symptom Based Disease Prediction"
            description="Enter patient symptoms for the model to predict disease."
            cta="Enter Symptoms"
            onClick={() => navigate("/patient-dashboard/symptoms")}
          />
          <FeatureCard
            title="View Results"
            description="Access previous diagnoses and review recommendations."
            cta="View Results"
            onClick={() => navigate("/patient-dashboard/results")}
          />
        </section>

        <section className="mt-16">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="mt-8 grid items-start gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                1
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                Upload & Input
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Upload medical images and enter patient symptoms.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                2
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                DL and ML Analysis
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Algorithms analyze the data for potential diagnoses.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                3
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Get Results</h3>
              <p className="mt-1 text-sm text-gray-600">
                Predicts image and produces hardcoded medications.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
