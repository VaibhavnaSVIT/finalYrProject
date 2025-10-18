import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PersonalInfoForm from "./PersonalInfoForm.jsx";
import ProfessionalInfoForm from "./ProfessionalInfoForm.jsx";
import VerificationInfoForm from "./VerificationInfoForm.jsx";
import { useNavigate, Link } from "react-router-dom";

const DoctorRegistration = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => {
    if (!validateStep(currentStep)) {
      alert("Please fill all required fields correctly before continuing.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const [formData, setFormData] = useState({
    personal_info: {
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      profilePhoto: null,
    },
    professional_info: {
      specialization: "",
      experience: "",
      education: [{ degree: "", university: "", year_of_completion: "" }],
      hospitalAffiliations: [""],
    },
    verification_info: {
      medicalLicense_no: "",
      documents: {
        degree_certificate: null,
        medical_license: null,
      },
    },
    password: "",
    confirm_password: "",
    enter_OTP: "",
  });

  useEffect(() => {
    localStorage.setItem("doctorForm", JSON.stringify(formData));
  }, [formData]);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSectionUpdate = (section, updatedFields, file = null) => {
    setFormData((prev) => {
      if (file) {
        if (section === "profilePhoto") {
          return {
            ...prev,
            personal_info: { ...prev.personal_info, profilePhoto: file },
          };
        }
        if (section === "documents") {
          return {
            ...prev,
            verification_info: {
              ...prev.verification_info,
              documents: {
                ...prev.verification_info.documents,
                ...updatedFields,
              },
            },
          };
        }
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          ...updatedFields,
        },
      };
    });
  };

  const sendOTP = async () => {
    if (!formData.personal_info.email) {
      toast.error("Please enter your email first.");
      return;
    }
    try {
      setOtpLoading(true);
      console.log("personal_info: ", formData.personal_info);
      const response = await axios.post(
        "http://127.0.0.1:8000/doctor/send-otp/",
        {
          email: formData.personal_info.email,
        }
      );
      toast.success("OTP sent successfully to your email!");
      setOtpSent(true);
    } catch (err) {
      console.error("Error sending OTP:", err);
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const validateStep = (step) => {
    const {
      personal_info,
      professional_info,
      verification_info,
      password,
      confirm_password,
      enter_OTP,
    } = formData;

    if (step === 1) {
      return (
        personal_info.fullName &&
        personal_info.email &&
        personal_info.phone &&
        personal_info.phone.length === 10 &&
        personal_info.gender &&
        personal_info.dob
      );
    }

    if (step === 2) {
      const { experience, education } = professional_info;
      const isValidYear = (year) => /^\d{4}$/.test(year);
      return (
        experience &&
        education.every(
          (edu) =>
            edu.degree && edu.university && isValidYear(edu.year_of_completion)
        )
      );
    }

    if (step === 3) {
      let medicalLicense_no_length = /^\d{7}$/.test(
        verification_info.medicalLicense_no
      );
      let enter_OTP_length = /^\d{6}$/.test(enter_OTP);
      return (
        medicalLicense_no_length === 7 &&
        password &&
        confirm_password &&
        password === confirm_password &&
        enter_OTP_length === 6 &&
        verification_info.documents.degree_certificate &&
        verification_info.documents.medical_license
      );
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      personal_info: { profilePhoto, ...personal_info_rest },
      verification_info,
      ...rest
    } = formData;

    const jsonData = {
      personal_info: personal_info_rest,
      professional_info: formData.professional_info,
      verification_info: {
        ...verification_info,
        documents: undefined,
      },
      password: formData.password,
      confirm_password: formData.confirm_password,
      enter_OTP: formData.enter_OTP,
    };

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/doctor/register/",
        jsonData
      );

      if (res.data.success) {
        const fileForm = new FormData();
        if (profilePhoto) fileForm.append("profilePhoto", profilePhoto);
        if (verification_info.documents.degree_certificate)
          fileForm.append(
            "degree_certificate",
            verification_info.documents.degree_certificate
          );
        if (verification_info.documents.medical_license)
          fileForm.append(
            "medical_license",
            verification_info.documents.medical_license
          );

        fileForm.append("email", formData.personal_info.email);

        const fileUploadRes = await axios.post(
          "http://127.0.0.1:8000/doctor/upload-doctor-files/",
          fileForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (fileUploadRes.data.message) {
          navigate("/doctor-login");
          toast.success("Registration complete!");  
        } else {
          toast.error("File upload failed");
        }
      } else {
        toast.error(res.data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="max-w-4xl mx-auto p-4 space-y-6"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">
        Doctor Registration
      </h2>

      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-3 w-3 rounded-full ${
              currentStep === step ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      {currentStep === 1 && (
        <PersonalInfoForm
          data={formData.personal_info}
          updateData={handleSectionUpdate}
        />
      )}
      {currentStep === 2 && (
        <ProfessionalInfoForm
          data={formData.professional_info}
          updateData={handleSectionUpdate}
        />
      )}
      {currentStep === 3 && (
        <VerificationInfoForm
          data={formData.verification_info}
          updateData={handleSectionUpdate}
        />
      )}

      <p className="mt-4 text-center">
        Have an account?
        <Link to="/doctor-login" className="text-blue-600 hover:underline">
          {" "}
          Login
        </Link>
      </p>

      {currentStep === 3 && (
        <>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block mb-1 font-medium"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={(e) =>
                setFormData({ ...formData, confirm_password: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex items-end gap-4 mt-4">
            <div className="flex-1">
              <label htmlFor="enter_OTP" className="block mb-1 font-medium">
                Enter OTP
              </label>
              <input
                type="text"
                id="enter_OTP"
                placeholder="Enter OTP"
                inputMode="numeric"
                value={formData.enter_OTP}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,6}$/.test(val)) {
                    setFormData({ ...formData, enter_OTP: val });
                  }
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <button
              type="button"
              onClick={sendOTP}
              disabled={otpLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 h-fit mt-auto"
            >
              {otpLoading
                ? "Sending OTP..."
                : otpSent
                ? "Resend OTP"
                : "Send OTP"}
            </button>
          </div>
        </>
      )}

      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Previous
          </button>
        )}
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="ml-auto bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            onClick={handleSubmit}
            className="ml-auto bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
          >
            Register
          </button>
        )}
      </div>
    </form>
  );
};

export default DoctorRegistration;
