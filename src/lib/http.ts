import axios, { type AxiosRequestConfig } from "axios";

// Base API URL is configured via Vite env or falls back to localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
// Only enable credentials if you rely on cookies/sessions. Defaults to false for JWT (Bearer) auth.
const withCreds = (import.meta.env.VITE_WITH_CREDENTIALS || "false").toLowerCase() === "true";
const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || "accessToken";
const refreshKey = import.meta.env.VITE_REFRESH_TOKEN_KEY || "refreshToken";

export const http = axios.create({
  baseURL,
  withCredentials: withCreds,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: withCreds,
});

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const stripTokenPrefix = (value: string) => {
  const lower = value.toLowerCase();
  if (lower.startsWith("bearer ")) return value.slice(7).trim();
  if (lower.startsWith("token ")) return value.slice(6).trim();
  return value.trim();
};

const buildAuthHeader = (token: string) => (token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`);

const clearStoredAuth = () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(refreshKey);
  localStorage.removeItem("userRole");
  localStorage.removeItem("authUserId");
  window.dispatchEvent(new Event("auth:logout"));
};

let refreshPromise: Promise<string | null> | null = null;

const obtainAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const res = await refreshClient.post<{ access: string }>("/accounts/token/refresh/", { refresh: refreshToken });
    const raw = res.data?.access;
    if (raw) {
      const sanitized = stripTokenPrefix(raw);
      localStorage.setItem(tokenKey, sanitized);
      return sanitized;
    }
  } catch (_err) {
    // Ignore and fall through to cleanup
  }
  return null;
};

const getFreshAccessToken = (refreshToken: string) => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await obtainAccessToken(refreshToken);
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

// Attach Authorization header if a token is stored (optional)
http.interceptors.request.use((config) => {
  const stored = localStorage.getItem(tokenKey);
  if (stored) {
    const token = stripTokenPrefix(stored);
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: buildAuthHeader(token),
      };
    }
  }
  return config;
});

// Attempt refresh-once behaviour before surfacing auth errors, then normalize messages
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error?.config as RetryableConfig | undefined;
    const status = error?.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("token/refresh")
    ) {
      const refreshToken = localStorage.getItem(refreshKey);
      if (refreshToken) {
        originalRequest._retry = true;
        const newAccess = await getFreshAccessToken(refreshToken);
        if (newAccess) {
          const authHeader = buildAuthHeader(newAccess);
          http.defaults.headers.common.Authorization = authHeader;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: authHeader,
          };
          return http(originalRequest);
        }
      }
      clearStoredAuth();
    }

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
