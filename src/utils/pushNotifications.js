/**
 * Push Notification Helper for FondPeace PWA
 * Handles browser permission requests, service worker registration,
 * VAPID key negotiation, and backend subscription synchronization.
 */

import { getApiBase } from "./apiConfig";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const isPushSupported = () => {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
};

export const getNotificationPermission = () => {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

/**
 * Register push subscription with backend server
 */
export const subscribeToWebPush = async () => {
  if (!isPushSupported() || Notification.permission !== "granted") return null;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !reg.pushManager) return null;

    const apiBase = getApiBase();

    // 1. Fetch VAPID Public Key from backend
    let publicKey = "BB5Q16oeAgiqmWG_sNfGlwqkZ9wtRQyOhQFykrPozxNzeSw6jIHJ_7052G3oVV_RZlueBftUzWp86WZpk4AP3gA";
    try {
      const keyRes = await fetch(`${apiBase}/notification/push/public-key`);
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        if (keyData.publicKey) {
          publicKey = keyData.publicKey;
        }
      }
    } catch (e) {
      console.warn("Using fallback VAPID key:", e.message);
    }

    // 2. Check existing subscription or create new
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // 3. Send subscription object to BackendK
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await fetch(`${apiBase}/notification/push/subscribe`, {
      method: "POST",
      headers,
      body: JSON.stringify({ subscription })
    });

    return subscription;
  } catch (err) {
    console.error("Failed to subscribe to Web Push:", err);
    return null;
  }
};

export const requestPushPermission = async () => {
  if (!isPushSupported()) return "unsupported";

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Subscribe to backend push service
      await subscribeToWebPush();

      // Trigger a welcoming native notification
      sendLocalTestNotification(
        "Notifications Activated! 🔔",
        "You'll now receive instant alerts for likes, comments, and trending reels on FondPeace.",
        "/"
      );
    }
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
};

export const sendLocalTestNotification = async (title, body, url = "/") => {
  if (!isPushSupported() || Notification.permission !== "granted") return;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        data: { url },
        vibrate: [100, 50, 100],
      });
    } else {
      new Notification(title, {
        body,
        icon: "/android-chrome-192x192.png",
      });
    }
  } catch (err) {
    console.error("Failed to show native notification:", err);
  }
};
