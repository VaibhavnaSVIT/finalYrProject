import React from "react";

const ProfessionalInfoForm = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData("professional_info", { [name]: value });
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...data.education];
    updated[index][field] = value;
    updateData("professional_info", { education: updated });
  };

  const addEducation = () => {
    const updated = [
      ...data.education,
      { degree: "", university: "", year_of_completion: "" },
    ];
    updateData("professional_info", { education: updated });
  };

  const removeEducation = (index) => {
    const updated = [...data.education];
    updated.splice(index, 1);
    updateData("professional_info", { education: updated });
  };

  const handleHospitalChange = (index, value) => {
    const updated = [...data.hospitalAffiliations];
    updated[index] = value;
    updateData("professional_info", { hospitalAffiliations: updated });
  };

  const addHospital = () => {
    const updated = [...data.hospitalAffiliations, ""];
    updateData("professional_info", { hospitalAffiliations: updated });
  };

  const removeHospital = (index) => {
    const updated = [...data.hospitalAffiliations];
    updated.splice(index, 1);
    updateData("professional_info", { hospitalAffiliations: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Professional Information</h3>

      <div>
        <label htmlFor="specialization" className="block mb-1 font-medium">
          Specialization (Optional)
        </label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          value={data.specialization}
          onChange={handleChange}
          placeholder="Enter specialization"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="experience" className="block mb-1 font-medium">
          Experience (in years)
        </label>
        <input
          type="number"
          id="experience"
          name="experience"
          value={data.experience}
          onChange={handleChange}
          placeholder="Enter experience"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Education</label>
        {data.education.map((edu, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="text-sm block mb-1">Degree</label>
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) =>
                  handleEducationChange(idx, "degree", e.target.value)
                }
                className="p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label className="text-sm block mb-1">University</label>
              <input
                type="text"
                placeholder="University"
                value={edu.university}
                onChange={(e) =>
                  handleEducationChange(idx, "university", e.target.value)
                }
                className="p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label className="text-sm block mb-1">Year</label>
              <input
                type="text"
                name="year_of_completion"
                value={edu.year_of_completion}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,4}$/.test(val)) {
                    handleEducationChange(idx, "year_of_completion", val);
                  }
                }}
                placeholder="Year of Completion"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {data.education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="col-span-3 text-red-500 text-sm hover:underline mt-1"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addEducation}
          className="text-blue-600 text-sm hover:underline mt-2"
        >
          + Add more education
        </button>
      </div>

      <div>
        <label className="block font-medium mb-1">
          Hospital Affiliations (Optional)
        </label>
        {data.hospitalAffiliations.map((hospital, idx) => (
          <div key={idx} className="flex gap-2 mt-2">
            <div className="w-full">
              <label className="text-sm block mb-1">Hospital Name</label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => handleHospitalChange(idx, e.target.value)}
                placeholder="Hospital Name"
                className="w-full p-2 border rounded"
              />
            </div>
            {data.hospitalAffiliations.length > 1 && (
              <button
                type="button"
                onClick={() => removeHospital(idx)}
                className="text-red-500 text-sm hover:underline self-end"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addHospital}
          className="text-blue-600 text-sm hover:underline mt-2"
        >
          + Add more hospitals
        </button>
      </div>
    </div>
  );
};

export default ProfessionalInfoForm;
