import axios from "axios";
import { clearToken, getToken } from "../utils/tokenStorage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Normalizes any error (network, timeout, validation, server) into a single readable message
export class ApiClientError extends Error {
  public status?: number;
  public errors?: string[];

  constructor(message: string, status?: number, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return Promise.reject(new ApiClientError("Unable to connect to ScanTrack server."));
      }

      const requestUrl = error.config?.url ?? "";
      const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => requestUrl.includes(path));

      // A 401 on any authenticated request means the session is invalid/expired; log out and redirect once.
      if (error.response.status === 401 && !isPublicAuthRequest) {
        clearToken();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      const data = error.response.data as { message?: string; errors?: string[] } | undefined;
      return Promise.reject(
        new ApiClientError(data?.message ?? "Something went wrong. Please try again.", error.response.status, data?.errors)
      );
    }
    return Promise.reject(new ApiClientError("Something went wrong. Please try again."));
  }
);
