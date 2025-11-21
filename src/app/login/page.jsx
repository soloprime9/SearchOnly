'use client';
import axios from 'axios';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import Link from 'next/link';

const Login = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    onSubmit: async (values) => {
      setSuccessMessage("");
      setErrorMessage("");
      setIsSubmitting(true);
      try {
        const result = await axios.post('https://backendk-z915.onrender.com/user/login', values);
        setSuccessMessage("Logged in successfully! Redirecting...");
        localStorage.setItem('token', result.data.token);
        setTimeout(() => window.location.href = "/", 1500);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-xl border-4 border-white bg-orange-500 shadow-2xl">
        <h2 className="font-extrabold text-white text-center text-3xl sm:text-4xl mb-6">
          Login
        </h2>

        {/* Success & Error Messages */}
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

        <form onSubmit={loginForm.handleSubmit}>
          <label htmlFor="email" className="block text-white font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={loginForm.values.email}
            onChange={loginForm.handleChange}
            className="w-full border-2 rounded-lg border-blue-500 p-2 mb-4 focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Enter your email"
          />

          <label htmlFor="password" className="block text-white font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={loginForm.values.password}
            onChange={loginForm.handleChange}
            className="w-full border-2 rounded-lg border-blue-500 p-2 mb-4 focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Enter your password"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full border-2 border-white rounded-full p-2 mt-2 text-white font-bold text-lg sm:text-xl transition duration-300 shadow-md
              ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
          >
            {isSubmitting ? 'Logging In...' : 'Login'}
          </button>
        </form>

        {/* Link to Create Account */}
        <div className="mt-6 text-center text-white/90">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-blue-800 hover:text-white/90 underline ml-1 transition">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
