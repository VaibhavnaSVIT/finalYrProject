import React from "react";

const Disclaimer = () => (
  <div
    role="alert"
    className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4"
  >
    <div className="flex items-start gap-3">
      <svg
        className="mt-0.5 h-5 w-5 text-amber-700"
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
      <div>
        <p className="font-semibold text-amber-900">Medical Disclaimer:</p>
        <p className="mt-1 text-sm text-amber-800">
          This system is for educational and research purposes only and not a
          substitute for professional medical advice, diagnosis, or treatment.
          Always consult qualified healthcare professionals for medical
          decisions.
        </p>
      </div>
    </div>
  </div>
);

export default Disclaimer;
