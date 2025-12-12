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
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...formData,
      requirements: formData.requirements.split(","),
      skillsKeywords: formData.skillsKeywords.split(","),
    };

    await fetch("https://list-back-nine.vercel.app/job/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Job Added Successfully!");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Add New Job</h1>

      <input placeholder="Company Name" className="input" 
        onChange={(e)=>setFormData({...formData, companyName: e.target.value})} />

      <input placeholder="Job Title" className="input" 
        onChange={(e)=>setFormData({...formData, jobTitle: e.target.value})} />

      <textarea placeholder="About Job" className="input" 
        onChange={(e)=>setFormData({...formData, aboutJob: e.target.value})} />

      <input placeholder="Requirements (comma separated)" className="input"
        onChange={(e)=>setFormData({...formData, requirements: e.target.value})} />

      <input placeholder="Salary Type (Monthly/Yearly)" className="input"
        onChange={(e)=>setFormData({...formData, salaryType: e.target.value})} />

      <input placeholder="Salary Range" className="input"
        onChange={(e)=>setFormData({...formData, salaryRange: e.target.value})} />

      <input placeholder="Apply Link" className="input"
        onChange={(e)=>setFormData({...formData, applyLink: e.target.value})} />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Job
      </button>
    </form>
  );
}
