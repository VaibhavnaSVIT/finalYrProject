import React from "react";
import DoctorHeader from "../../components/DoctorHeader.jsx";
import { Link } from "react-router-dom";
import Disclaimer from "../../components/Disclaimer.jsx";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

const DoctorResultsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Doctor's previous diagnoses and recommendations.
          </h1>
          <p className="mt-2 text-gray-600">Review previous input data.</p>
        </section>

        <div className="mt-6">
          <Disclaimer />
        </div>

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
              to="/doctor-dashboard/upload"
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Upload Images
            </Link>
            <Link
              to="/doctor-dashboard/symptoms"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Enter Symptoms
            </Link>
          </div>
        </div>
        <section className="mt-10">
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Result items will appear here (studies, reports, recommendations)
            once available.
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorResultsPage;
