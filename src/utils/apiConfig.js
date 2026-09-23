export const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return "https://backend-k.vercel.app";
};

export const API_BASE = getApiBase();

export const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  try {
    const token = localStorage.getItem("token");
    return token ? { "x-auth-token": token, "Authorization": `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};
