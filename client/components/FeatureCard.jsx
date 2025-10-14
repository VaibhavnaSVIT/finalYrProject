import React from "react";

const FeatureCard = ({ title, description, cta, onClick }) => {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg focus-within:shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>

      <button
        onClick={onClick}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/60"
      >
        {cta}
      </button>
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-gray-900/5" />
    </div>
  );
};

export default FeatureCard;
