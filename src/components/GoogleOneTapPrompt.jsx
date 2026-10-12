"use client";

import { useEffect } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";

/**
 * Pure Native Google Identity Services (GSI) One Tap Auto-Prompt
 * 
 * Directly loads Google's official GSI SDK (https://accounts.google.com/gsi/client)
 * and prompts Google's native iframe UI (as seen on LinkedIn/Pinterest) without
 * any manually created mock HTML.
 *
 * Requirements for Google's native popup to display:
 * 1. Valid Google OAuth Web Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
 * 2. Origin authorized in Google Cloud Console (http://localhost:3000, https://www.fondpeace.com)
 * 3. User is signed into a Google account in the browser
 */
export default function GoogleOneTapPrompt() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Do not show if user is already logged in
    const token = localStorage.getItem("token");
    if (token) return;

    // 2. Do not prompt on dedicated auth or admin pages
    if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/register" ||
      pathname?.startsWith("/admin")
    ) {
      return;
    }

    // 3. Resolve Google OAuth Web Client ID
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.warn(
        "[Google One Tap] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in .env.local. Please add your Google OAuth Web Client ID to display Google's native popup."
      );
      return;
    }

    const initializeNativeGoogleOneTap = () => {
      if (!window.google?.accounts?.id) return;

      try {
        // Initialize Official Google Identity Services
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) return;

            try {
              const apiBase = getApiBase();
              const res = await axios.post(`${apiBase}/user/google-auth`, {
                credential: response.credential,
              });

              if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                if (res.data?.user) {
                  localStorage.setItem("user", JSON.stringify(res.data.user));
                  if (res.data.user.email) {
                    localStorage.setItem("fondpeace_remembered_email", res.data.user.email);
                  }
                }

                // Passive Telemetry Logging
                if (window.__trackFondPeaceActivity) {
                  window.__trackFondPeaceActivity("google_onetap_native_success", {
                    email: res.data.user?.email,
                  });
                }

                // Reload seamlessly into authenticated session
                window.location.reload();
              }
            } catch (authErr) {
              console.error("[Google One Tap] Server verification error:", authErr);
            }
          },
          auto_select: true, // Google Auto Sign-in with zero clicks if previously approved
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true, // Mandatory for Chrome 2024-2026 FedCM standard
          itp_support: true,
        });

        // Trigger Google's native One Tap prompt directly from Google's servers
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log(
              "[Google One Tap] Not displayed reason:",
              notification.getNotDisplayedReason()
            );
          }
          if (notification.isSkippedMoment()) {
            console.log(
              "[Google One Tap] Skipped moment:",
              notification.getSkippedReason()
            );
          }
          if (notification.isDismissedMoment()) {
            console.log(
              "[Google One Tap] Dismissed moment:",
              notification.getDismissedReason()
            );
          }
        });
      } catch (err) {
        console.error("[Google One Tap] Initialization exception:", err);
      }
    };

    // 4. Load official Google GSI SDK script dynamically
    if (window.google?.accounts?.id) {
      initializeNativeGoogleOneTap();
    } else {
      const existingScript = document.getElementById("google-gsi-client");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeNativeGoogleOneTap;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initializeNativeGoogleOneTap);
      }
    }
  }, [pathname]);

  // Pure Native Google SDK: Google renders its own iframe prompt directly on the DOM
  return null;
}
