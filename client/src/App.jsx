import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PatientRegister from "../components/PatientRegistration/PatientRegistration";
import PatientDashboard from "../pages/PatientDashboard/PatientDashboard";
import PatientLogin from "../components/PatientLogin/PatientLogin";
import DoctorRegistration from "../components/DoctorRegistration/DoctorRegistration";
import DoctorLogin from "../components/DoctorLogin/DoctorLogin";
import LandingPage from "../components/LandingPage/LandingPage";
import DoctorDashboard from "../pages/DoctorDashboard/DoctorDashboard";
import AdminLogin from "../components/AdminLogin/AdminLogin";
import AdminSignup from "../components/AdminSignup/AdminSignup";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import NotFound404Page from "../components/NotFound404Page";
import UploadPage from "../pages/PatientDashboard/UploadImage";
import DoctorUploadImage from "../pages/DoctorDashboard/DoctorUploadImage";
import DoctorSymptomsAssessment from "../pages/DoctorDashboard/DoctorSymptomsAssessment";
import DoctorRequestsPage from "../pages/DoctorDashboard/DoctorRequestsPage";
import SymptomAssessmentPage from "../pages/PatientDashboard/SymptomsAssessment";
import ResultsPage from "../pages/PatientDashboard/ResultsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient-register" element={<PatientRegister />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-dashboard/upload" element={<UploadPage />} />
        <Route
          path="/patient-dashboard/symptoms"
          element={<SymptomAssessmentPage />}
        />
        <Route path="/patient-dashboard/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFound404Page />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route
          path="/doctor-dashboard/upload"
          element={<DoctorUploadImage />}
        />
        <Route
          path="/doctor-dashboard/symptoms"
          element={<DoctorSymptomsAssessment />}
        />
        <Route
          path="/doctor-dashboard/requests"
          element={<DoctorRequestsPage />}
        />
        <Route path="/doctor-register" element={<DoctorRegistration />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
