import axios from "axios";
import Cookies from "js-cookie";

function normalizeApiUrl(raw?: string): string {
  if (!raw || !raw.trim()) return "http://localhost:4000/api/v1";
  const url = raw.trim().replace(/\/+$/, "");
  if (url.endsWith("/api/v1")) return url;
  if (url.endsWith("/api")) return `${url}/v1`;
  return `${url}/api/v1`;
}

export const API_BASE_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get("prism_access_token");
  if (token && token !== "undefined" && token !== "null" && token.trim().length > 10) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response.data, // backend wraps everything as { success, data, timestamp }
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get("prism_refresh_token");
      if (!refreshToken) {
        Cookies.remove("prism_access_token");
        Cookies.remove("prism_refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          Cookies.set("prism_access_token", data.data.accessToken, { expires: 1 });
          Cookies.set("prism_refresh_token", data.data.refreshToken, { expires: 7 });
          pendingQueue.forEach((cb) => cb());
          pendingQueue = [];
        } catch (refreshErr) {
          Cookies.remove("prism_access_token");
          Cookies.remove("prism_refresh_token");
          if (typeof window !== "undefined") window.location.href = "/login";
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
      return new Promise((resolve) => {
        pendingQueue.push(() => resolve(api(original)));
      });
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}
