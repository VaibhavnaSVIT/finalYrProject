import React from "react";

const VerificationInfoForm = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData("verification_info", { [name]: value });
  };

  const handleFileChange = (name, file) => {
    const updatedDocuments = {
      ...data.documents,
      [name]: file,
    };
    updateData("verification_info", { documents: updatedDocuments });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Verification Information</h3>

      <div>
        <label htmlFor="medicalLicense_no" className="block mb-1 font-medium">
          Medical License Number
        </label>
        <input
          type="text"
          id="medicalLicense_no"
          name="medicalLicense_no"
          value={data.medicalLicense_no}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,7}$/.test(val)) {
              updateData("verification_info", { [e.target.name]: val });
            }
          }}
          placeholder="Medical License Number"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="degree_certificate" className="block mb-1 font-medium">
          Degree Certificate (.jpg, .pdf)
        </label>
        <input
          id="degree_certificate"
          type="file"
          accept=".jpg,.pdf"
          onChange={(e) =>
            handleFileChange("degree_certificate", e.target.files[0])
          }
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="medical_license" className="block mb-1 font-medium">
          Medical License Document (.jpg, .pdf)
        </label>
        <input
          id="medical_license"
          type="file"
          accept=".jpg,.pdf"
          onChange={(e) =>
            handleFileChange("medical_license", e.target.files[0])
          }
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VerificationInfoForm;
