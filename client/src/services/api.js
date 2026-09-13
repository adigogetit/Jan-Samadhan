import axios from "axios";

const configuredApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const apiBaseUrl = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default api;