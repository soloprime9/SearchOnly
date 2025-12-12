"use client";
import { useState } from "react";

export default function AddJob() {
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

  async function handleSubmit(e) {
    e.preventDefault();

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

    alert("Job Added Successfully!");
  }

  const Input = ({ ...props }) => (
    <input
      {...props}
      className="w-full p-3 border rounded-md bg-white shadow-sm"
    />
  );

  const Select = ({ children, ...props }) => (
    <select
      {...props}
      className="w-full p-3 border rounded-md bg-white shadow-sm"
    >
      {children}
    </select>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 space-y-4 bg-gray-100 rounded-lg shadow-md"
    >
      <h1 className="text-3xl font-bold mb-4">Add New Job</h1>

      <Input
        placeholder="Company Name"
        onChange={(e) =>
          setFormData({ ...formData, companyName: e.target.value })
        }
      />

      <Input
        placeholder="Job Title"
        onChange={(e) =>
          setFormData({ ...formData, jobTitle: e.target.value })
        }
      />

      <textarea
        placeholder="About Job"
        className="w-full p-3 border rounded-md bg-white shadow-sm"
        onChange={(e) => setFormData({ ...formData, aboutJob: e.target.value })}
      />

      <Input
        placeholder="Requirements (comma separated)"
        onChange={(e) =>
          setFormData({ ...formData, requirements: e.target.value })
        }
      />

      {/* Salary Type */}
      <Select
        onChange={(e) =>
          setFormData({ ...formData, salaryType: e.target.value })
        }
      >
        <option value="">Select Salary Type</option>
        <option value="Monthly">Monthly</option>
        <option value="Yearly">Yearly</option>
        <option value="Hourly">Hourly</option>
      </Select>

      <Input
        placeholder="Salary Range"
        onChange={(e) =>
          setFormData({ ...formData, salaryRange: e.target.value })
        }
      />

      <Input
        placeholder="Apply Link"
        onChange={(e) =>
          setFormData({ ...formData, applyLink: e.target.value })
        }
      />

      <Input
        placeholder="Job Location"
        onChange={(e) =>
          setFormData({ ...formData, jobLocation: e.target.value })
        }
      />

      {/* Job Type */}
      <Select
        onChange={(e) =>
          setFormData({ ...formData, jobType: e.target.value })
        }
      >
        <option value="">Select Job Type</option>
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
        <option value="Remote">Remote</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Contract">Contract</option>
      </Select>

      {/* Experience */}
      <Select
        onChange={(e) =>
          setFormData({ ...formData, experienceLevel: e.target.value })
        }
      >
        <option value="">Experience Level</option>
        <option value="Fresher">Fresher</option>
        <option value="Junior">Junior</option>
        <option value="Mid-Level">Mid-Level</option>
        <option value="Senior">Senior</option>
        <option value="Lead">Lead</option>
      </Select>

      <Input
        placeholder="Category (e.g. IT, Finance)"
        onChange={(e) =>
          setFormData({ ...formData, category: e.target.value })
        }
      />

      <Input
        placeholder="Skills Keywords (comma separated)"
        onChange={(e) =>
          setFormData({ ...formData, skillsKeywords: e.target.value })
        }
      />

      {/* Remote toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          onChange={(e) =>
            setFormData({ ...formData, isRemote: e.target.checked })
          }
        />
        Remote Job?
      </label>

      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700">
        Submit Job
      </button>
    </form>
  );
}
