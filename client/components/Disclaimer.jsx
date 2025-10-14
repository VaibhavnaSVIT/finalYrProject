import React from "react";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

const Disclaimer = () => (
  <div
    role="alert"
    className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4"
  >
    <div className="flex items-start gap-3">
      <ReportProblemOutlinedIcon className="text-amber-800" />
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
