// src/utils/mediaCleanup.js
// ⚡ Global Media Terminator: Kills all ghost audio/video immediately on navigation or unmount

export function stopAllMediaPlayback(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const { resetSources = false } = options;

  try {
    // 1. Pause and reset all HTML5 <video> elements
    document.querySelectorAll("video").forEach((video) => {
      try {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
        if (resetSources) {
          video.removeAttribute("src");
          video.load();
        }
      } catch (_) {}
    });

    // 2. Pause and reset all <audio> elements
    document.querySelectorAll("audio").forEach((audio) => {
      try {
        audio.pause();
        audio.muted = true;
        audio.currentTime = 0;
        if (resetSources) {
          audio.removeAttribute("src");
          audio.load();
        }
      } catch (_) {}
    });

    // 3. Stop any YouTube iframe audio via postMessage and clean source
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        const src = iframe.src || "";
        if (src.includes("youtube") || src.includes("embed") || src.includes("youtu.be")) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            "*"
          );
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "stopVideo", args: [] }),
            "*"
          );
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "mute", args: [] }),
            "*"
          );
          if (resetSources) {
            iframe.src = "about:blank";
          }
        }
      } catch (_) {}
    });
  } catch (_) {}
}
