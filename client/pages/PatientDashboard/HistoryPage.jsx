import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientHeader from "../../components/PatientHeader.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Disclaimer from "../../components/Disclaimer.jsx";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

const STATUS_OPTIONS = ["All Statuses", "Approved", "Pending"];

const Tile = ({ label, value, colorClass }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="mt-1 text-xs font-medium text-gray-600">{label}</div>
  </div>
);

const HistoryPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    total_records: 0,
    approved: 0,
    pending: 0,
  });
  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please log in to view medical history.");
        navigate("/patient-login");
        return;
      }
      const response = await axios.get(
        "http://127.0.0.1:8000/patient/medical-history-summary/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCounts({
        total_records: response.data.total_records || 0,
        approved: response.data.approved || 0,
        pending: response.data.pending || 0,
      });
    } catch (error) {
      console.error("Failed to fetch medical history counts:", error);
      toast.error("Failed to load medical summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    fetchCounts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Medical History
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View previous medications, diagnoses, and doctor suggestions.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            <CachedOutlinedIcon />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="mt-6">
          <Disclaimer />
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile
            label="Total Records"
            value={counts.total_records}
            colorClass="text-gray-900"
          />
          <Tile
            label="Approved"
            value={counts.approved}
            colorClass="text-emerald-600"
          />
          <Tile
            label="Pending"
            value={counts.pending}
            colorClass="text-amber-600"
          />
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <ReportProblemOutlinedIcon className="text-gray-600" />
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
