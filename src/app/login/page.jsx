'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LeftSidebar from "@/components/LeftSidebar";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";
import { API_BASE } from "@/utils/apiConfig";
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password) {
      setErrorMessage("Please enter your username/email and password");
      playPop();
      return;
    }

    setIsSubmitting(true);
    playTap();

    try {
      // Send both email and username as identifier for maximum backend flexibility
      const payload = {
        email: trimmedIdentifier,
        username: trimmedIdentifier,
        identifier: trimmedIdentifier,
        password: password,
      };

      const result = await axios.post(`${API_BASE}/user/login`, payload);

      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);
        if (result.data?.UserDetail) {
          localStorage.setItem('user', JSON.stringify(result.data.UserDetail));
        }
      }

      playChime();
      setSuccessMessage("Logged in successfully! Welcome back to FondPeace.");
      toast.success("Welcome back!");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      playPop();
      const msg = error.response?.data?.message || "Invalid credentials. Please verify and try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white flex flex-col relative overflow-hidden">
      {/* Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white/[0.04] dark:bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-8 transition-all">
          
          {/* Logo & Header */}
          <div className="text-center mb-7">
            <Link href="/" onClick={() => playTap()} className="inline-flex items-center gap-2 group mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg">F</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Fond<span className="text-blue-500">Peace</span>
              </span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white/95">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Sign in with your username or email
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username or Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rahul or user@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  onClick={() => playTap()}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-gray-400">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              onClick={() => playTap()}
              className="font-bold text-blue-400 hover:text-blue-300 ml-1 transition-colors underline"
            >
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
