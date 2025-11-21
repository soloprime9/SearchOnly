'use client';
import React, { useState } from "react";
import axios from "axios";
import Link from 'next/link'; // Use Link for internal navigation in Next.js

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "", 
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // To prevent double clicks

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(""); // Clear previous messages
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await axios.post("https://backendk-z915.onrender.com/user/add", formData);
      
      console.log("Result: ", result);
      
      // 1. Show success message first
      setSuccessMessage("Account created successfully! Redirecting to login...");

      // 2. Wait a moment then redirect
      setTimeout(() => {
          // Note: Using 'window.location.href' is acceptable for a hard redirect after form submission
          window.location.href = "/login";
      }, 2000); // Redirect after 2 seconds
      
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      // 3. Set error message from the backend or a default one
      setErrorMessage(error.response?.data?.message || "An unexpected error occurred during signup.");
      
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-xl border-4 border-white bg-orange-500 shadow-2xl">
        <h2 className="font-extrabold text-white text-center text-3xl sm:text-4xl mb-6">
            Create Account
        </h2>
        
        {/* Success and Error Message Display */}
        {successMessage && (
          <div className="font-bold p-3 mb-4 rounded bg-green-500 text-white text-center transition-all duration-300">
            ✅ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="font-bold p-3 mb-4 rounded bg-red-600 text-white text-center transition-all duration-300">
            ❌ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username" className="block text-white font-semibold mb-1">
                Name
            </label>
          <input
            id="username"
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleInputChange}
            className="w-full border-2 rounded-lg border-blue-500 p-2 mb-4 focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Enter your username"
          />

          <label htmlFor="email" className="block text-white font-semibold mb-1">
                Email
            </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border-2 border-blue-500 p-2 mb-4 rounded-lg focus:ring-2 focus:ring-blue-300 transition"
            placeholder="name@example.com"
          />

          <label htmlFor="password" className="block text-white font-semibold mb-1">
                Password
            </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full border-2 border-blue-500 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Minimum 6 characters"
          />

          <a
            href="fondpeace.com"
            className="link hover:underline text-white/90 text-sm w-full mb-4 inline-block text-right"
          >
            Forget Password?
          </a>
          
          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className={`w-full border-2 border-white rounded-full p-2 mt-2 text-white font-bold text-lg sm:text-xl transition duration-300 shadow-md 
                ${isSubmitting || !!successMessage 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
          >
            {isSubmitting ? 'Signing Up...' : 'Signup Now'}
          </button>
        </form>
        
        {/* Link to Login Page */}
        <div className="mt-6 text-center text-white/90">
            Already have an account? 
            <Link href="/login" className="font-bold text-blue-800 hover:text-white/90 underline ml-1 transition">
                Login here
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
