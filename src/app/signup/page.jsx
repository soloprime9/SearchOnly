'use client';
import React, { useState } from "react";
import axios from "axios";
import Link from 'next/link';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "", 
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await axios.post("https://backendk-z915.onrender.com/user/add", formData);
      console.log("Result: ", result);

      setSuccessMessage("✅ Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || "An unexpected error occurred during signup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 p-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white shadow-2xl border border-white">
        <h2 className="font-extrabold text-gray-900 text-3xl sm:text-4xl mb-6 text-center">
          Create Account
        </h2>

        {/* Messages */}
        {successMessage && (
          <div className="font-semibold p-3 mb-4 rounded-lg bg-green-500 text-white text-center animate-pulse transition-all duration-300">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="font-semibold p-3 mb-4 rounded-lg bg-red-600 text-white text-center transition-all duration-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
              Name
            </label>
            <input
              id="username"
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 6 characters"
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
            />
          </div>

          <div className="flex justify-end mb-2">
            <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className={`w-full rounded-full p-3 font-bold text-white text-lg transition duration-300 shadow-md
              ${isSubmitting || !!successMessage
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
              }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm sm:text-base">
          Already have an account? 
          <Link href="/login" className="font-semibold text-orange-600 hover:underline ml-1 transition">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
