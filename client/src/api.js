import axios from "axios";
export const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("retro_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const setAuth = (token, user) => {
  localStorage.setItem("retro_token", token);
  localStorage.setItem("retro_user", JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem("retro_token");
  localStorage.removeItem("retro_user");
};
export const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("retro_user"));
  } catch {
    return null;
  }
};
