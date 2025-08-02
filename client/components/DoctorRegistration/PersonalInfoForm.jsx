import React from "react";

const PersonalInfoForm = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData("personal_info", { [name]: value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      updateData("personal_info", { phone: value });
    }
  };

  const handleFileChange = (e) => {
    updateData("profilePhoto", {}, e.target.files[0]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Personal Information</h3>

      <div>
        <label htmlFor="fullName" className="block mb-1 font-medium">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block mb-1 font-medium">
          Phone Number
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={data.phone}
          onChange={handlePhoneChange}
          placeholder="Enter phone number"
          required
          pattern="[0-9]{10}"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block mb-1 font-medium">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={data.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label htmlFor="dob" className="block mb-1 font-medium">
          Date of Birth
        </label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={data.dob}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="profilePhoto" className="block mb-1 font-medium">
          Profile Photo (.jpg only)
        </label>
        <input
          type="file"
          id="profilePhoto"
          accept=".jpg"
          onChange={handleFileChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
