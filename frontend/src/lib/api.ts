import axios, { AxiosHeaders } from "axios";
import toast from "react-hot-toast";

const USER_BASE_URL =
  process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:5000/api/v1/user";
const CHAT_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:5002/api/v1";

const authHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userApi = axios.create({
  baseURL: USER_BASE_URL,
});

export const chatApi = axios.create({
  baseURL: CHAT_BASE_URL,
});

const handleUnauthorized = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  if (!window.location.pathname.startsWith("/login")) {
    toast.error("Session expired. Please login again.");
    window.location.href = "/login";
  }
};

for (const instance of [userApi, chatApi]) {
  instance.interceptors.request.use((config) => {
    const headers = authHeaders();
    const tokenHeader = headers.Authorization;
    if (tokenHeader) {
      if (config.headers && typeof (config.headers as { set?: unknown }).set === "function") {
        (config.headers as { set: (key: string, value: string) => void }).set(
          "Authorization",
          tokenHeader as string
        );
      } else {
        config.headers = AxiosHeaders.from({
          ...(config.headers || {}),
          Authorization: tokenHeader,
        });
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        handleUnauthorized();
      }
      return Promise.reject(error);
    }
  );
}
