// src/utils/mediaCleanup.js
// ⚡ Global Media Terminator: Safely pauses all playing video/audio without breaking DOM sources

export function stopAllMediaPlayback() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    // 1. Pause all HTML5 <video> elements
    document.querySelectorAll("video").forEach((video) => {
      try {
        if (!video.paused) {
          video.pause();
        }
      } catch (_) {}
    });

    // 2. Pause all <audio> elements
    document.querySelectorAll("audio").forEach((audio) => {
      try {
        if (!audio.paused) {
          audio.pause();
        }
      } catch (_) {}
    });

    // 3. Pause any YouTube iframes via postMessage
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        const src = iframe.src || "";
        if (src.includes("youtube") || src.includes("embed") || src.includes("youtu.be")) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            "*"
          );
        }
      } catch (_) {}
    });
  } catch (_) {}
}
