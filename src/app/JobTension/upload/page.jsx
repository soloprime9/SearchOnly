"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddJob() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    aboutJob: "",
    requirements: "",
    salaryType: "",
    salaryRange: "",
    applyLink: "",
    jobLocation: "",
    jobType: "",
    experienceLevel: "",
    category: "",
    skillsKeywords: "",
    isRemote: false,
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Validate required fields
  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "companyName",
      "jobTitle",
      "aboutJob",
      "requirements",
      "salaryType",
      "salaryRange",
      "applyLink",
      "jobLocation",
      "jobType",
      "experienceLevel",
      "category",
      "skillsKeywords",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert("Please fill all required fields!");
      return;
    }

    const payload = {
      ...formData,
      requirements: formData.requirements.split(",").map((r) => r.trim()),
      skillsKeywords: formData.skillsKeywords.split(",").map((r) => r.trim()),
    };

    const res = await fetch("https://list-back-nine.vercel.app/job/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to add job!");
      return;
    }

    const data = await res.json();
  const jobId = data.job._id; // Get the newly created job ID

  // Redirect to the newly created Job Detail page
  router.push(`/JobTension/${jobId}`);
    
  };

  // Simple Input component
  const Input = ({ name, ...props }) => (
    <div>
      <input
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-3 border rounded-md bg-white shadow-sm"
        {...props}
      />
      {errors[name] && <p className="text-red-600 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  // Simple Select component
  const Select = ({ name, children }) => (
    <div>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-3 border rounded-md bg-white shadow-sm"
      >
        {children}
      </select>
      {errors[name] && <p className="text-red-600 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold mb-4">Add New Job</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="companyName" placeholder="Company Name" />
        <Input name="jobTitle" placeholder="Job Title" />
        <textarea
          name="aboutJob"
          value={formData.aboutJob}
          onChange={handleChange}
          placeholder="About Job"
          className="w-full p-3 border rounded-md bg-white shadow-sm"
        />
        {errors.aboutJob && <p className="text-red-600 text-sm">{errors.aboutJob}</p>}

        <Input name="requirements" placeholder="Requirements (comma separated)" />
        <Select name="salaryType">
          <option value="">Select Salary Type</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
          <option value="Hourly">Hourly</option>
        </Select>
        <Input name="salaryRange" placeholder="Salary Range" />
        <Input name="applyLink" placeholder="Apply Link" />
        <Input name="jobLocation" placeholder="Job Location" />
        <Select name="jobType">
          <option value="">Select Job Type</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Contract">Contract</option>
        </Select>
        <Select name="experienceLevel">
          <option value="">Experience Level</option>
          <option value="Fresher">Fresher</option>
          <option value="Junior">Junior</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
        </Select>
        <Input name="category" placeholder="Category (e.g. IT, Finance)" />
        <Input name="skillsKeywords" placeholder="Skills Keywords (comma separated)" />

        {/* Remote */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isRemote"
            checked={formData.isRemote}
            onChange={handleChange}
          />
          Remote Job?
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600"
          >
            {showPreview ? "Hide Preview" : "Preview Job"}
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
          >
            Submit Job
          </button>
        </div>
      </form>

      {/* LIVE PREVIEW */}
      {showPreview && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow space-y-2">
          <h2 className="text-2xl font-bold">{formData.jobTitle || "Job Title"}</h2>
          <p className="text-gray-600">{formData.companyName || "Company Name"}</p>
          <p>{formData.aboutJob}</p>
          <p>
            <strong>Requirements:</strong> {formData.requirements}
          </p>
          <p>
            <strong>Salary:</strong> {formData.salaryType} — {formData.salaryRange}
          </p>
          <p>
            <strong>Job Type / Experience:</strong> {formData.jobType} / {formData.experienceLevel}
          </p>
          <p>
            <strong>Category:</strong> {formData.category}
          </p>
          <p>
            <strong>Skills:</strong> {formData.skillsKeywords}
          </p>
          <p>
            <strong>Location:</strong> {formData.jobLocation}
          </p>
          {formData.isRemote && <p className="text-green-700">Remote Job Available</p>}
          <a
            href={formData.applyLink || "#"}
            target="_blank"
            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Link
          </a>
        </div>
      )}
    </div>
  );
}
