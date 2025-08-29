import React, { useState } from "react";
import Header from "../../components/Header";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = ["All Statuses", "Approved", "Pending", "Rejected"];

const Tile = ({ label, value, colorClass }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="mt-1 text-xs font-medium text-gray-600">{label}</div>
  </div>
);

const HistoryPage = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    // Hook up to backend later
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Medical History
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View previous diagnoses, recommendations, and doctor reviews
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative grow">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.9 14.32a7 7 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by diagnosis, symptoms, or record ID..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none ring-gray-900/10 focus:bg-white focus:ring-2"
              />
            </div>

            <div className="shrink-0">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full min-w-[200px] rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none ring-gray-900/10 focus:bg-white focus:ring-2"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Total Records" value={0} colorClass="text-gray-900" />
          <Tile label="Approved" value={0} colorClass="text-emerald-600" />
          <Tile label="Pending" value={0} colorClass="text-amber-600" />
          <Tile label="Rejected" value={0} colorClass="text-rose-600" />
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-2 text-sm text-gray-600">
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
            <p>No medical records found matching your criteria.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Upload Images
          </Link>
          <Link
            to="/symptoms"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Enter Symptoms
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
