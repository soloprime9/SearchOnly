/**
 * Push Notification Helper for FondPeace PWA
 * Handles browser permission requests, service worker registration,
 * and native push testing.
 */

export const isPushSupported = () => {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
};

export const getNotificationPermission = () => {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const requestPushPermission = async () => {
  if (!isPushSupported()) return "unsupported";

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Trigger a welcoming native notification
      sendLocalTestNotification(
        "Notifications Activated! 🔔",
        "You'll now receive instant alerts for likes, comments, and messages on FondPeace.",
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
