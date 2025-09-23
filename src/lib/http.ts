import axios from "axios";

// Base API URL is configured via Vite env or falls back to localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
// Only enable credentials if you rely on cookies/sessions. Defaults to false for JWT (Bearer) auth.
const withCreds = (import.meta.env.VITE_WITH_CREDENTIALS || "false").toLowerCase() === "true";

export const http = axios.create({
  baseURL,
  withCredentials: withCreds,
});

// Attach Authorization header if a token is stored (optional)
http.interceptors.request.use((config) => {
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || "accessToken";
  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };
  }
  return config;
});

// Basic error unwrapping so consumers get consistent messages
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const headers = error?.response?.headers || {};
    const contentType: string = (headers["content-type"] || headers["Content-Type"] || "").toString();
    let message: string | undefined;

    // Normalize common DRF error shapes
    if (data) {
      if (typeof data === "string") {
        // Avoid dumping HTML error pages into UI
        const looksLikeHtml = data.trim().startsWith("<!DOCTYPE") || data.trim().startsWith("<html");
        message = looksLikeHtml || contentType.includes("text/html")
          ? `Server error${status ? ` (${status})` : ""}`
          : data;
      } else if (Array.isArray(data)) {
        message = data[0];
      } else if (typeof data === "object") {
        message = (data as any).message || (data as any).detail;
        if (!message && (data as any).non_field_errors && Array.isArray((data as any).non_field_errors)) {
          message = (data as any).non_field_errors[0];
        }
        if (!message) {
          const firstKey = Object.keys(data as any)[0];
          const firstVal = firstKey ? (data as any)[firstKey] : undefined;
          if (Array.isArray(firstVal)) message = firstVal[0];
          else if (typeof firstVal === "string") message = firstVal;
        }
      }
    }

    if (!message) message = error.message || "Request failed";
    return Promise.reject({ status, message, data });
  }
);

export default http;
