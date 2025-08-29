import React from "react";
import Header from "../../components/Header";
import { Link } from "react-router-dom";

const ResultsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Results</h1>
          <p className="mt-2 text-gray-600">
            Review AI analyses, reports, and recommendations when available
          </p>
        </section>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099a1.5 1.5 0 012.486 0l6.3 10.03A1.5 1.5 0 0115.8 15H4.2a1.5 1.5 0 01-1.244-2.871l5.3-9.03zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg>
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

export default ResultsPage;
