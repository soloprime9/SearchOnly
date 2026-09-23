'use client';

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import PhoneField from "@/components/PhoneField";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";
import { API_BASE } from "@/utils/apiConfig";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Phone } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneData, setPhoneData] = useState({
    phone: "",
    country: "",
    city: "",
    isValid: true,
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear previous username suggestions on edit
    if (e.target.name === "username") {
      setSuggestions([]);
      setErrorMessage("");
    }
  };

  const handleSelectSuggestion = (suggested) => {
    playTap();
    setFormData((prev) => ({ ...prev, username: suggested }));
    setSuggestions([]);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setSuggestions([]);

    const cleanUsername = formData.username.trim().toLowerCase();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !formData.password) {
      setErrorMessage("Please fill in username, email, and password");
      playPop();
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      playPop();
      return;
    }

    // Optional phone validation: only check if phone is entered
    if (phoneData.phone && phoneData.phone.trim() && !phoneData.isValid) {
      setErrorMessage("Please enter a valid phone number or skip it");
      playPop();
      return;
    }

    setIsSubmitting(true);
    playTap();

    try {
      const payload = {
        username: cleanUsername,
        email: cleanEmail,
        password: formData.password,
        phone: phoneData.phone || "",
        country: phoneData.country || "",
        city: phoneData.city || "",
      };

      const result = await axios.post(`${API_BASE}/user/add`, payload);

      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        if (result.data?.user) {
          localStorage.setItem("user", JSON.stringify(result.data.user));
        }
      }

      playChime();
      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
      setSuccessMessage("Account created successfully! Welcome to FondPeace.");
      toast.success("Welcome aboard!");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      playPop();
      const res = error.response?.data;
      const msg = res?.message || "An unexpected error occurred during signup.";
      setErrorMessage(msg);
      toast.error(msg);

      if (Array.isArray(res?.suggestions) && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white flex flex-col relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white/[0.04] dark:bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-8 transition-all">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link href="/" onClick={() => playTap()} className="inline-flex items-center gap-2 group mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg">F</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Fond<span className="text-blue-500">Peace</span>
              </span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white/95">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Join the modern 2026 creator discussion community
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Smart Username Suggestions Pills */}
          {suggestions.length > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
              <span className="text-blue-300 font-semibold block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Suggested available usernames:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-medium border border-blue-500/30 transition-colors"
                  >
                    @{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose unique username"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Optional Phone Toggle */}
            <div>
              {!showPhoneInput ? (
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setShowPhoneInput(true);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+ Add phone number (optional)</span>
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Phone Number (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        playTap();
                        setShowPhoneInput(false);
                        setPhoneData({ phone: "", country: "", city: "", isValid: true });
                      }}
                      className="text-[11px] text-gray-400 hover:text-gray-200"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="text-black">
                    <PhoneField onChangeFinal={setPhoneData} />
                  </div>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3.5 text-gray-400 hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className={`w-full py-3.5 px-4 mt-2 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-[0.98] ${
                isSubmitting || !!successMessage
                  ? "bg-blue-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20 hover:shadow-blue-500/35"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              onClick={() => playTap()}
              className="font-bold text-blue-400 hover:text-blue-300 ml-1 transition-colors underline"
            >
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignUp;
