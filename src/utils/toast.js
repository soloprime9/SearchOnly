// Event-driven Glassmorphic Toast Dispatcher

let listeners = [];

export const toast = {
  success: (message) => dispatchToast(message, "success"),
  error: (message) => dispatchToast(message, "error"),
  info: (message) => dispatchToast(message, "info"),
  love: (message) => dispatchToast(message, "love"),
  subscribe: (fn) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
};

function dispatchToast(message, type = "info") {
  const id = Date.now() + Math.random().toString(36).slice(2, 6);
  listeners.forEach((fn) => fn({ id, message, type }));
}
