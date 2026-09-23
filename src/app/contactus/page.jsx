'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  User, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ArrowRight,
  Headphones
} from "lucide-react";
import { playTap, playChime } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";

const INQUIRY_TOPICS = [
  "General Support",
  "Creator Partnership",
  "Feature Request",
  "Report an Issue",
  "Press & Media"
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Support",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTopicSelect = (topic) => {
    playTap();
    setFormData((prev) => ({ ...prev, subject: topic }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    playTap();

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      playChime();
      triggerConfetti();
      toast.success("Message sent! We will respond shortly.");

      setFormData({
        name: "",
        email: "",
        subject: "General Support",
        message: "",
      });
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-14 px-3 sm:px-4">
      {/* Container Card */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-white/80 dark:bg-zinc-950/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.4)]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 shadow-sm">
            <Headphones className="w-3.5 h-3.5" />
            <span>Community Support & Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
            Have questions, feedback, or need help with your account? Our team is here to assist.
          </p>
        </div>

        {/* Feedback Banner */}
        {submitted && (
          <div className="mb-8 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 relative z-10 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Message Received!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Thank you for contacting us. A FondPeace team member will get back to you within 24 hours.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Form Column (2 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            
            {/* Topic Selection Chips */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Inquiry Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {INQUIRY_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleTopicSelect(topic)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                      formData.subject === topic
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                        : "bg-black/[0.04] dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label htmlFor="message" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your question or message in detail..."
                className="w-full p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info Sidebar Column */}
          <div className="space-y-4">
            
            {/* Direct Email Card */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Direct Email</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Reach out directly via email for business inquiries or escalations.
              </p>
              <a
                href="mailto:contact@fondpeace.com"
                className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline block truncate"
              >
                contact@fondpeace.com
              </a>
            </div>

            {/* Response Time Card */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fast Response SLA</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Our support desk usually responds to inquiries within 24 hours on business days.
              </p>
            </div>

            {/* Trust & Safety Card */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Community First</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your report helps keep FondPeace safe, transparent, and authentic for everyone.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
