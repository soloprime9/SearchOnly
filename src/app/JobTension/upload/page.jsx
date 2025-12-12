"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import JobPreview from "@/Job/JobPreview";

// -------------------------------------------------------------------
// FIX: Move Input/Select components OUTSIDE the AddJob function
// This ensures they are stable components and not re-created on every render.
// This preserves the focus state when other parts of the UI (like JobPreview) re-render.
// -------------------------------------------------------------------

// Stable Input Component
const Input = ({ name, formData, handleChange, errors, ...props }) => (
  <div>
    <input
      // Added type="text" for consistency, although default, it's safer.
      type={props.type || "text"} 
      name={name}
      autoComplete="off"
      spellCheck="false"
      value={formData[name]}
      onChange={handleChange}
      className="w-full p-3 border rounded-md bg-white shadow-sm"
      {...props}
    />
    {errors[name] && (
      <p className="text-red-600 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

// Stable Select Component
const Select = ({ name, formData, handleChange, errors, children }) => (
  <div>
    <select
      name={name}
      value={formData[name]}
      onChange={handleChange}
      className="w-full p-3 border rounded-md bg-white shadow-sm"
    >
      {children}
    </select>
    {errors[name] && (
      <p className="text-red-600 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);
// -------------------------------------------------------------------

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

  // Prevent preview re-render breaking inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "companyName", "jobTitle", "aboutJob", "requirements",
      "salaryType", "salaryRange", "applyLink", "jobLocation",
      "jobType", "experienceLevel", "category", "skillsKeywords"
    ];

    requiredFields.forEach((field) => {
      // Allow boolean false (like isRemote) or 0 to pass validation
      if (typeof formData[field] === 'string' && !formData[field].trim()) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      requirements: formData.requirements.split(",").map((r) => r.trim()).filter(r => r.length > 0),
      skillsKeywords: formData.skillsKeywords.split(",").map((r) => r.trim()).filter(r => r.length > 0),
    };

    try {
      const res = await fetch("https://list-back-nine.vercel.app/job/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add job!");
      }
      
      const data = await res.json();

      router.push(`/JobTension/${data.job._id}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Preview data preparation is fine here (no useMemo needed for this simple object)
  const previewData = {
    ...formData,
    // Safely split and trim (filters out empty strings resulting from multiple commas)
    requirements: formData.requirements
      ? formData.requirements.split(",").map((r) => r.trim()).filter(r => r.length > 0)
      : [],
    skillsKeywords: formData.skillsKeywords
      ? formData.skillsKeywords.split(",").map((r) => r.trim()).filter(r => r.length > 0)
      : [],
  };


  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold mb-4">Add New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pass all necessary props to the now-stable components */}
        <Input 
            name="companyName" 
            placeholder="Company Name" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />
        <Input 
            name="jobTitle" 
            placeholder="Job Title" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />

        <textarea
          name="aboutJob"
          autoComplete="off"
          spellCheck="false"
          value={formData.aboutJob}
          onChange={handleChange}
          placeholder="About Job"
          className="w-full p-3 border rounded-md bg-white shadow-sm"
        />
        {errors.aboutJob && (
          <p className="text-red-600 text-sm">{errors.aboutJob}</p>
        )}

        <Input 
            name="requirements" 
            placeholder="Requirements (comma separated)" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />

        <Select 
            name="salaryType" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors}
        >
          <option value="">Select Salary Type</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
          <option value="Hourly">Hourly</option>
        </Select>

        <Input 
            name="salaryRange" 
            placeholder="Salary Range" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />
        <Input 
            name="applyLink" 
            placeholder="Apply Link" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />
        <Input 
            name="jobLocation" 
            placeholder="Job Location" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />

        <Select 
            name="jobType" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors}
        >
          <option value="">Select Job Type</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Contract">Contract</option>
        </Select>

        <Select 
            name="experienceLevel" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors}
        >
          <option value="">Experience Level</option>
          <option value="Fresher">Fresher</option>
          <option value="Junior">Junior</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
        </Select>

        <Input 
            name="category" 
            placeholder="Category (e.g. IT, Finance)" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />
        <Input 
            name="skillsKeywords" 
            placeholder="Skills Keywords (comma separated)" 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors} 
        />

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

      {/* The preview component re-renders, but since Input/Select are stable,
          it won't break the form focus anymore. */}
      {showPreview && <JobPreview job={previewData} />}
    </div>
  );
}










// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import JobPreview from "@/Job/JobPreview";

// export default function AddJob() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     companyName: "",
//     jobTitle: "",
//     aboutJob: "",
//     requirements: "",
//     salaryType: "",
//     salaryRange: "",
//     applyLink: "",
//     jobLocation: "",
//     jobType: "",
//     experienceLevel: "",
//     category: "",
//     skillsKeywords: "",
//     isRemote: false,
//   });

//   const [errors, setErrors] = useState({});
//   const [showPreview, setShowPreview] = useState(false);

//   // Prevent preview re-render breaking inputs
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const validate = () => {
//     const newErrors = {};
//     const requiredFields = [
//       "companyName", "jobTitle", "aboutJob", "requirements",
//       "salaryType", "salaryRange", "applyLink", "jobLocation",
//       "jobType", "experienceLevel", "category", "skillsKeywords"
//     ];

//     requiredFields.forEach((field) => {
//       if (!formData[field].trim()) {
//         newErrors[field] = "This field is required";
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const payload = {
//       ...formData,
//       requirements: formData.requirements.split(",").map((r) => r.trim()),
//       skillsKeywords: formData.skillsKeywords.split(",").map((r) => r.trim()),
//     };

//     try {
//       const res = await fetch("https://list-back-nine.vercel.app/job/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Failed to add job!");
//       const data = await res.json();

//       router.push(`/JobTension/${data.job._id}`);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // FIX 1: No useMemo — prevent re-render glitch
//   const previewData = {
//     ...formData,
//     requirements: formData.requirements
//       ? formData.requirements.split(",").map((r) => r.trim())
//       : [],
//     skillsKeywords: formData.skillsKeywords
//       ? formData.skillsKeywords.split(",").map((r) => r.trim())
//       : [],
//   };

//   // FIX 2: Input component now stable (type added)
//   const Input = ({ name, ...props }) => (
//     <div>
//       <input
//         type="text"
//         name={name}
//         autoComplete="off"
//         spellCheck="false"
//         value={formData[name]}
//         onChange={handleChange}
//         className="w-full p-3 border rounded-md bg-white shadow-sm"
//         {...props}
//       />
//       {errors[name] && (
//         <p className="text-red-600 text-sm mt-1">{errors[name]}</p>
//       )}
//     </div>
//   );

//   const Select = ({ name, children }) => (
//     <div>
//       <select
//         name={name}
//         value={formData[name]}
//         onChange={handleChange}
//         className="w-full p-3 border rounded-md bg-white shadow-sm"
//       >
//         {children}
//       </select>
//       {errors[name] && (
//         <p className="text-red-600 text-sm mt-1">{errors[name]}</p>
//       )}
//     </div>
//   );

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
//       <h1 className="text-3xl font-bold mb-4">Add New Job</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input name="companyName" placeholder="Company Name" />
//         <Input name="jobTitle" placeholder="Job Title" />

//         <textarea
//           name="aboutJob"
//           autoComplete="off"
//           spellCheck="false"
//           value={formData.aboutJob}
//           onChange={handleChange}
//           placeholder="About Job"
//           className="w-full p-3 border rounded-md bg-white shadow-sm"
//         />
//         {errors.aboutJob && (
//           <p className="text-red-600 text-sm">{errors.aboutJob}</p>
//         )}

//         <Input name="requirements" placeholder="Requirements (comma separated)" />

//         <Select name="salaryType">
//           <option value="">Select Salary Type</option>
//           <option value="Monthly">Monthly</option>
//           <option value="Yearly">Yearly</option>
//           <option value="Hourly">Hourly</option>
//         </Select>

//         <Input name="salaryRange" placeholder="Salary Range" />
//         <Input name="applyLink" placeholder="Apply Link" />
//         <Input name="jobLocation" placeholder="Job Location" />

//         <Select name="jobType">
//           <option value="">Select Job Type</option>
//           <option value="Full-Time">Full-Time</option>
//           <option value="Part-Time">Part-Time</option>
//           <option value="Remote">Remote</option>
//           <option value="Hybrid">Hybrid</option>
//           <option value="Contract">Contract</option>
//         </Select>

//         <Select name="experienceLevel">
//           <option value="">Experience Level</option>
//           <option value="Fresher">Fresher</option>
//           <option value="Junior">Junior</option>
//           <option value="Mid-Level">Mid-Level</option>
//           <option value="Senior">Senior</option>
//           <option value="Lead">Lead</option>
//         </Select>

//         <Input name="category" placeholder="Category (e.g. IT, Finance)" />
//         <Input name="skillsKeywords" placeholder="Skills Keywords (comma separated)" />

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             name="isRemote"
//             checked={formData.isRemote}
//             onChange={handleChange}
//           />
//           Remote Job?
//         </label>

//         <div className="flex gap-2">
//           <button
//             type="button"
//             onClick={() => setShowPreview(!showPreview)}
//             className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600"
//           >
//             {showPreview ? "Hide Preview" : "Preview Job"}
//           </button>

//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
//           >
//             Submit Job
//           </button>
//         </div>
//       </form>

//       {showPreview && <JobPreview job={previewData} />}
//     </div>
//   );
// }
