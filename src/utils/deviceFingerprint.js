/**
 * Real-Time Hardware, System & Behavioral Fingerprint Extractor (2025/2026 Web Standards)
 * Zero external dependencies. Extracts 100% genuine hardware, GPU, audio,
 * storage, speech, system fonts, WebGL capabilities, battery, display physics,
 * and automated anti-bot consistency scoring.
 * 
 * Safe, passive, non-intrusive. Zero permissions asked from the user.
 */

// Simple Fast 32-bit FNV-1a Hash for canvas, audio & font buffers
function fnv1a(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16);
}

// 1. Extract Real GPU Vendor, Renderer & Deep WebGL Hardware Limits
export function getGpuInfo() {
  if (typeof window === "undefined") {
    return {
      vendor: "unknown",
      renderer: "unknown",
      maxTextureSize: 0,
      extensionsCount: 0,
      webglVersion: "none"
    };
  }

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      return {
        vendor: "unsupported",
        renderer: "unsupported",
        maxTextureSize: 0,
        extensionsCount: 0,
        webglVersion: "none"
      };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown"
      : gl.getParameter(gl.VENDOR) || "generic";
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown"
      : gl.getParameter(gl.RENDERER) || "generic";

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
    const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0;
    const extensions = gl.getSupportedExtensions() || [];

    return {
      vendor,
      renderer,
      maxTextureSize,
      maxRenderbufferSize,
      extensionsCount: extensions.length,
      webglVersion: canvas.getContext("webgl2") ? "WebGL 2.0" : "WebGL 1.0"
    };
  } catch (_) {
    return {
      vendor: "restricted",
      renderer: "restricted",
      maxTextureSize: 0,
      extensionsCount: 0,
      webglVersion: "error"
    };
  }
}

// 2. Extract Real Canvas 2D Rasterization Signature
export function getCanvasFingerprint() {
  if (typeof window === "undefined") return "none";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "unsupported";

    // Draw stylized text with shadows and overlapping gradients
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = "#069";
    ctx.fillText("FondPeace 🚀 <canvas> 1.0", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("FondPeace 🚀 <canvas> 1.0", 4, 17);

    // Subtle geometric bezier curve with composite blending
    ctx.strokeStyle = "rgba(255, 0, 128, 0.5)";
    ctx.beginPath();
    ctx.arc(50, 45, 10, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();

    const dataUrl = canvas.toDataURL();
    return fnv1a(dataUrl);
  } catch (_) {
    return "restricted";
  }
}

// 3. Extract Real AudioContext Hardware Math Signature
export async function getAudioFingerprint() {
  if (typeof window === "undefined") return "none";
  try {
    const AudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioContextClass) return "unsupported";

    // Render 1 channel, 44100Hz audio buffer for 0.1s
    const context = new AudioContextClass(1, 44100, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.reduction.setValueAtTime(-20, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const audioBuffer = await context.startRendering();
    const channelData = audioBuffer.getChannelData(0);

    let sum = 0;
    for (let i = 0; i < channelData.length; i += 100) {
      sum += Math.abs(channelData[i]);
    }
    return fnv1a(sum.toString());
  } catch (_) {
    return "restricted";
  }
}

// 4. System Installed Fonts Enumeration via Layout Metric Probing
export function getInstalledSystemFonts() {
  if (typeof window === "undefined" || !document.body) return [];

  try {
    const testFonts = [
      "Roboto", "Segoe UI", "San Francisco", "Helvetica Neue", "Arial",
      "Calibri", "Consolas", "Courier New", "Georgia", "Tahoma",
      "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS", "Ubuntu",
      "Noto Sans", "Nirmala UI", "Mangal", "Apple Color Emoji", "Segoe UI Emoji"
    ];

    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";
    const h = document.getElementsByTagName("body")[0];

    // Measure base widths
    const baseWidths = {};
    const baseHeights = {};
    for (const base of baseFonts) {
      const s = document.createElement("span");
      s.style.fontSize = testSize;
      s.style.fontFamily = base;
      s.style.position = "absolute";
      s.style.left = "-9999px";
      s.style.visibility = "hidden";
      s.innerHTML = testString;
      h.appendChild(s);
      baseWidths[base] = s.offsetWidth;
      baseHeights[base] = s.offsetHeight;
      h.removeChild(s);
    }

    const detected = [];
    for (const font of testFonts) {
      let matched = false;
      for (const base of baseFonts) {
        const s = document.createElement("span");
        s.style.fontSize = testSize;
        s.style.fontFamily = `'${font}',${base}`;
        s.style.position = "absolute";
        s.style.left = "-9999px";
        s.style.visibility = "hidden";
        s.innerHTML = testString;
        h.appendChild(s);
        const match = s.offsetWidth !== baseWidths[base] || s.offsetHeight !== baseHeights[base];
        h.removeChild(s);
        if (match) {
          matched = true;
          break;
        }
      }
      if (matched) detected.push(font);
    }

    return detected;
  } catch (_) {
    return [];
  }
}

// 5. Extract Battery Status (Android Chrome, Edge, Samsung Internet)
export async function getBatteryTelemetry() {
  if (typeof window === "undefined" || !navigator.getBattery) {
    return { status: "unsupported", level: null, charging: null };
  }
  try {
    const b = await navigator.getBattery();
    return {
      status: "available",
      levelPercent: `${Math.round(b.level * 100)}%`,
      charging: Boolean(b.charging),
      chargingTimeSec: b.chargingTime || 0,
      dischargingTimeSec: b.dischargingTime === Infinity ? "unlimited" : b.dischargingTime
    };
  } catch (_) {
    return { status: "restricted", level: null, charging: null };
  }
}

// 6. Extract Speech Synthesis Voices Profile (Installed OS language packs)
function getSpeechVoicesProfile() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { count: 0, languages: [] };
  }
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    const uniqueLangs = Array.from(new Set(voices.map(v => v.lang).filter(Boolean))).slice(0, 5);
    return {
      count: voices.length,
      sampleVoices: voices.slice(0, 3).map(v => `${v.name} (${v.lang})`),
      languages: uniqueLangs
    };
  } catch (_) {
    return { count: 0, languages: [] };
  }
}

// 7. Extract Media Devices Hardware Count (Cameras, Microphones, Speakers)
async function getMediaDevicesSummary() {
  if (typeof window === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return { cameras: 0, microphones: 0, speakers: 0 };
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    let cameras = 0;
    let microphones = 0;
    let speakers = 0;
    devices.forEach(d => {
      if (d.kind === "videoinput") cameras++;
      else if (d.kind === "audioinput") microphones++;
      else if (d.kind === "audiooutput") speakers++;
    });
    return { cameras, microphones, speakers };
  } catch (_) {
    return { cameras: 0, microphones: 0, speakers: 0 };
  }
}

// 8. Extract Storage Quota & Free Disk Size
async function getStorageEstimate() {
  if (typeof window === "undefined" || !navigator.storage?.estimate) {
    return { quotaGB: "unknown", usedMB: "unknown" };
  }
  try {
    const { quota, usage } = await navigator.storage.estimate();
    return {
      quotaGB: quota ? (quota / (1024 * 1024 * 1024)).toFixed(1) + " GB" : "unknown",
      usedMB: usage ? (usage / (1024 * 1024)).toFixed(1) + " MB" : "0 MB"
    };
  } catch (_) {
    return { quotaGB: "unknown", usedMB: "unknown" };
  }
}

// 9. Extract Performance & Memory Timing
function getPerformanceMetrics() {
  if (typeof window === "undefined") return {};
  try {
    const mem = window.performance?.memory;
    const memory = mem ? {
      heapLimitMB: Math.round(mem.jsHeapSizeLimit / (1024 * 1024)) + " MB",
      heapUsedMB: Math.round(mem.usedJSHeapSize / (1024 * 1024)) + " MB",
    } : null;

    let timing = null;
    const navEntries = window.performance?.getEntriesByType?.("navigation");
    if (navEntries && navEntries.length > 0) {
      const entry = navEntries[0];
      timing = {
        dnsTimeMs: Math.max(0, Math.round(entry.domainLookupEnd - entry.domainLookupStart)),
        tcpConnectMs: Math.max(0, Math.round(entry.connectEnd - entry.connectStart)),
        ttfbMs: Math.max(0, Math.round(entry.responseStart - entry.requestStart)),
      };
    }

    return { memory, timing };
  } catch (_) {
    return {};
  }
}

// 10. Extract Connected Gamepads (PS5/Xbox/Bluetooth controllers)
function getGamepadStatus() {
  if (typeof window === "undefined" || !navigator.getGamepads) return { connected: false, count: 0 };
  try {
    const pads = navigator.getGamepads();
    let count = 0;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i]) count++;
    }
    return { connected: count > 0, count };
  } catch (_) {
    return { connected: false, count: 0 };
  }
}

// 11. Extract CPU Math Precision Floating-Point Fingerprint (Hardware architecture)
export function getMathPrecisionFingerprint() {
  try {
    const results = [
      Math.sin(1e10),
      Math.cos(1e10),
      Math.tan(-1e300),
      Math.sinh(1),
      Math.cosh(10),
      Math.exp(1),
      Math.log(1e-10)
    ];
    return fnv1a(results.join(","));
  } catch (_) {
    return "unsupported";
  }
}

// 12. Extract JavaScript Engine Stack Signature (V8 vs SpiderMonkey vs JSCore)
export function getJsEngineSignature() {
  if (typeof window === "undefined") return { engine: "ssr", stackDepth: 0 };
  try {
    const err = new Error();
    const stack = err.stack || "";
    let engine = "unknown";
    if (stack.includes("    at ")) engine = "V8 (Chromium/Edge/Android)";
    else if (stack.includes("@")) {
      engine = stack.includes("@debugger") ? "SpiderMonkey (Firefox)" : "JavaScriptCore (WebKit/Apple)";
    }
    return {
      engine,
      stackDepth: stack.split("\n").length
    };
  } catch (_) {
    return { engine: "restricted", stackDepth: 0 };
  }
}

// 13. Extract Passive Permissions Matrix (including Clipboard, Notifications, Sensors)
export async function getPermissionsMatrix() {
  if (typeof window === "undefined" || !navigator.permissions?.query) {
    return { status: "unsupported" };
  }
  const permNames = [
    "notifications",
    "clipboard-read",
    "clipboard-write",
    "camera",
    "microphone",
    "geolocation"
  ];
  const matrix = {};
  await Promise.all(
    permNames.map(async (name) => {
      try {
        const res = await navigator.permissions.query({ name });
        matrix[name] = res.state; // 'granted', 'denied', or 'prompt'
      } catch (_) {
        matrix[name] = "restricted_or_unsupported";
      }
    })
  );
  return matrix;
}

// 14. Extract PWA & Display Mode (Installed Home Screen App vs Browser Tab)
export function getPwaStatus() {
  if (typeof window === "undefined") return { isPwa: false, displayMode: "browser" };
  try {
    const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
    return {
      isPwa: Boolean(isStandalone),
      displayMode: isStandalone ? "standalone_pwa" : "browser_tab"
    };
  } catch (_) {
    return { isPwa: false, displayMode: "browser" };
  }
}

// 15. Extract Hardware Sensors Availability (Gyroscope, Accelerometer)
export function getSensorsAvailability() {
  if (typeof window === "undefined") return { motion: false, orientation: false };
  return {
    motionSensor: "DeviceMotionEvent" in window,
    orientationSensor: "DeviceOrientationEvent" in window
  };
}

// 16. Extract Privacy Signals (Do-Not-Track, Global Privacy Control)
export function getPrivacySignals() {
  if (typeof window === "undefined") return {};
  try {
    const nav = navigator || {};
    return {
      doNotTrack: nav.doNotTrack === "1" || window.doNotTrack === "1",
      globalPrivacyControl: Boolean(nav.globalPrivacyControl)
    };
  } catch (_) {
    return {};
  }
}

// 17. Extract Ghost Profile / Guest Interests Vector from Local Cache
function getGuestInterestsVector() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("fond_guest_watch_history");
    if (!raw) return { totalWatched: 0, topTopics: [] };
    const history = JSON.parse(raw);
    return {
      totalWatched: history.totalWatched || 0,
      topTopics: Array.isArray(history.topTopics) ? history.topTopics.slice(0, 5) : []
    };
  } catch (_) {
    return null;
  }
}

// Helper to record watched category/topic in Ghost Profile
export function recordGuestTopicInterest(topicName) {
  if (typeof window === "undefined" || !topicName) return;
  try {
    const raw = localStorage.getItem("fond_guest_watch_history");
    const history = raw ? JSON.parse(raw) : { totalWatched: 0, topTopics: [] };
    history.totalWatched = (history.totalWatched || 0) + 1;
    const normalized = topicName.startsWith("#") ? topicName : `#${topicName}`;
    if (!history.topTopics.includes(normalized)) {
      history.topTopics.unshift(normalized);
      if (history.topTopics.length > 6) history.topTopics.pop();
    }
    localStorage.setItem("fond_guest_watch_history", JSON.stringify(history));
  } catch (_) {}
}

// 12. Automated Anti-Bot & Spoofing Consistency Verification
function evaluateTrustScore({ nav, gpu, hardware }) {
  let score = 100;
  const flags = [];

  // Flag 1: Automated Headless Webdriver
  if (nav.webdriver) {
    score -= 60;
    flags.push("navigator.webdriver_detected");
  }

  // Flag 2: Mobile User-Agent with 0 touch points
  const isMobileUA = /mobile|android|iphone/i.test(nav.userAgent || "");
  if (isMobileUA && (hardware.maxTouchPoints || 0) === 0) {
    score -= 35;
    flags.push("mobile_ua_without_touch_screen");
  }

  // Flag 3: Virtualized / Software GPU renderer (headless scraper)
  const rendererLower = (gpu.renderer || "").toLowerCase();
  if (rendererLower.includes("swiftshader") || rendererLower.includes("llvmpipe") || rendererLower.includes("mesa offscreen")) {
    score -= 40;
    flags.push("software_virtualized_gpu");
  }

  return {
    score: Math.max(0, score),
    isAuthenticHuman: score >= 60,
    riskLevel: score >= 80 ? "LOW_RISK" : score >= 50 ? "MEDIUM_RISK" : "HIGH_RISK_BOT",
    flags
  };
}

// Cached device signature in memory
let cachedTelemetry = null;

/**
 * Extract complete genuine 360° visitor telemetry.
 * Safe, passive, zero permissions asked from the user.
 */
export async function getFullDeviceTelemetry() {
  if (typeof window === "undefined") return {};
  if (cachedTelemetry) return cachedTelemetry;

  try {
    const gpu = getGpuInfo();
    const canvasHash = getCanvasFingerprint();
    let audioHash = "pending";
    try {
      audioHash = await getAudioFingerprint();
    } catch (_) {
      audioHash = "none";
    }

    const nav = navigator || {};
    const screenObj = window.screen || {};

    // 1. Media Hardware, Storage, Battery & Gamepad
    const [mediaDevices, storage, battery] = await Promise.all([
      getMediaDevicesSummary(),
      getStorageEstimate(),
      getBatteryTelemetry()
    ]);

    // 2. Installed System Fonts & Speech Voices
    const fonts = getInstalledSystemFonts();
    const speechVoices = getSpeechVoicesProfile();

    // 3. Performance & Memory Heap
    const performance = getPerformanceMetrics();
    const gamepads = getGamepadStatus();

    // 4. Ghost Guest Preferences
    const guestProfile = getGuestInterestsVector();

    // 5. Network connection details
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
    const network = {
      effectiveType: conn.effectiveType || "unknown", // '4g', '3g', 'wifi'
      downlink: conn.downlink !== undefined ? `${conn.downlink} Mbps` : "unknown",
      rtt: conn.rtt !== undefined ? `${conn.rtt} ms` : "unknown",
      saveData: Boolean(conn.saveData)
    };

    // 6. Hardware specifications
    const hardware = {
      cpuCores: nav.hardwareConcurrency || "unknown",
      ramMemory: nav.deviceMemory ? `${nav.deviceMemory} GB` : "unknown",
      maxTouchPoints: nav.maxTouchPoints || 0,
      isTouchDevice: (nav.maxTouchPoints || 0) > 0,
      storageQuota: storage.quotaGB,
      storageUsed: storage.usedMB,
      mediaDevices,
      gamepads
    };

    // 7. Screen and Display Capabilities (HDR, Color Gamut, Split-screen detection)
    const matchMediaFn = window.matchMedia ? window.matchMedia.bind(window) : () => ({ matches: false });
    const isSplitScreen = Math.abs(window.outerWidth - window.innerWidth) > 160 && !nav.userAgent.includes("Mobile");

    const display = {
      resolution: `${screenObj.width || window.innerWidth}x${screenObj.height || window.innerHeight}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      windowDimensions: `${window.outerWidth}x${window.outerHeight}`,
      isSplitScreenWindow: Boolean(isSplitScreen),
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screenObj.colorDepth ? `${screenObj.colorDepth}-bit` : "unknown",
      orientation: screenObj.orientation?.type || (window.innerHeight > window.innerWidth ? "portrait" : "landscape"),
      hdrSupported: matchMediaFn("(dynamic-range: high)").matches,
      wideColorGamutP3: matchMediaFn("(color-gamut: p3)").matches,
      pointerPrecision: matchMediaFn("(pointer: fine)").matches ? "mouse/trackpad" : "touch/stylus",
      hoverSupported: matchMediaFn("(hover: hover)").matches
    };

    // 8. Environment, Fonts & Timezone
    let timezone = "unknown";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    } catch (_) {}

    const environment = {
      language: nav.language || "en",
      languages: Array.isArray(nav.languages) ? nav.languages.slice(0, 3) : [nav.language || "en"],
      timezone,
      timeZoneOffsetMin: new Date().getTimezoneOffset(),
      darkMode: matchMediaFn("(prefers-color-scheme: dark)").matches,
      cookiesEnabled: nav.cookieEnabled !== false,
      speechVoicesCount: speechVoices.count,
      speechLanguages: speechVoices.languages,
      installedFonts: fonts.slice(0, 8),
      totalFontsDetected: fonts.length
    };

    // 9. Notification & Permissions Matrix (Passive checks without prompting)
    let notificationState = "unsupported";
    if (typeof window !== "undefined" && "Notification" in window) {
      notificationState = Notification.permission;
    }
    const permissionsMatrix = await getPermissionsMatrix();

    // 10. Math Floating-Point, JS Engine & Sensor Telemetry
    const mathPrecision = getMathPrecisionFingerprint();
    const jsEngine = getJsEngineSignature();
    const pwa = getPwaStatus();
    const sensors = getSensorsAvailability();
    const privacy = getPrivacySignals();

    // 11. Automated Anti-Bot & Spoofing Consistency Verification
    const antiBotAudit = evaluateTrustScore({ nav, gpu, hardware });

    // 12. Compound unique 64-bit device fingerprint with multi-layer entropy
    const seed = `${gpu.renderer}_${canvasHash}_${audioHash}_${mathPrecision}_${display.resolution}_${hardware.cpuCores}_${timezone}_${hardware.storageQuota}_${fonts.length}_${jsEngine.engine}`;
    const visitorDeviceId = `FP-${fnv1a(seed)}-${fnv1a(gpu.vendor)}`;

    cachedTelemetry = {
      visitorDeviceId,
      gpuVendor: gpu.vendor,
      gpuRenderer: gpu.renderer,
      maxTextureSize: gpu.maxTextureSize,
      canvasHash,
      audioHash,
      mathPrecision,
      jsEngine,
      hardware,
      battery,
      display,
      network,
      environment,
      performance,
      antiBotAudit,
      notificationState,
      permissionsMatrix,
      pwa,
      sensors,
      privacy,
      guestProfile
    };

    return cachedTelemetry;
  } catch (err) {
    console.warn("Device telemetry extraction warning:", err.message);
    return {};
  }
}
