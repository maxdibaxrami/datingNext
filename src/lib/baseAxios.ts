// lib/http.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: '/',                  // same-origin calls
  withCredentials: false,        // we rely on Bearer token, not cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-access-token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
