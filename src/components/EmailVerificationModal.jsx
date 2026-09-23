"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getApiBase } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { ShieldCheck, Mail, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";

export default function EmailVerificationModal({
  isOpen,
  onClose,
  userEmail,
  onVerificationSuccess,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (!isOpen) return;
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, val) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    // Handle paste of multiple digits
    if (cleaned.length > 1) {
      const parts = cleaned.slice(0, 6).split("");
      const updated = [...digits];
      parts.forEach((p, i) => {
        if (i < 6) updated[i] = p;
      });
      setDigits(updated);
      const nextIndex = Math.min(parts.length, 5);
      inputRefs.current[nextIndex]?.focus();
      playTap();
      return;
    }

    const updated = [...digits];
    updated[index] = cleaned[0];
    setDigits(updated);
    playTap();

    // Auto advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || sendingCode || !userEmail) return;
    setSendingCode(true);
    playTap();
    try {
      const apiBase = getApiBase();
      const res = await axios.post(`${apiBase}/user/otp/send-email`, {
        email: userEmail,
      });
      if (res.data?.success) {
        toast.success(`Verification code resent to ${userEmail}! 📧`);
        setResendTimer(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otpCode = digits.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    playPop();

    try {
      const apiBase = getApiBase();
      const res = await axios.post(`${apiBase}/user/otp/verify-email`, {
        email: userEmail,
        otp: otpCode,
      });

      if (res.data?.success) {
        setIsSuccess(true);
        playChime();
        triggerHeartBurst();
        toast.success(res.data.message || "Email verified successfully! 🛡️");

        if (onVerificationSuccess) {
          onVerificationSuccess(res.data.user);
        }

        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired verification code");
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playTap();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {!isSuccess ? (
          <>
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Mail size={30} className="stroke-[2.2]" />
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Verify Your Email Address
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              We sent a 6-digit verification code to
              <br />
              <strong className="text-gray-800 dark:text-gray-200">{userEmail || "your email"}</strong>
            </p>

            {/* 6 Digit Input Boxes */}
            <form onSubmit={handleVerifyOtp} className="mt-6">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900/80 border-2 border-gray-200 dark:border-zinc-800 rounded-xl focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || digits.join("").length !== 6}
                className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Verify & Unlock Shield 🛡️</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
              <span>Didn&apos;t receive the email?</span>
              {resendTimer > 0 ? (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendingCode}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {sendingCode ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Success Screen */
          <div className="py-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border-2 border-emerald-500/30 flex items-center justify-center mb-4 shadow-xl">
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </div>
            <h4 className="text-xl font-black text-gray-900 dark:text-white">
              Email Verified! 🛡️
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs leading-relaxed">
              Your account is now authenticated with a Verified Shield badge on FondPeace community.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
