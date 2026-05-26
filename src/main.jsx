import './urlRecovery';
import React from 'react';
import { createRoot } from "react-dom/client";
import axios from 'axios';
import App from "./app/App";
import "./styles/index.css";

// Global CORS Bypass Interceptor for Bolsa API
axios.interceptors.request.use((config) => {
  if (config.method === 'post' && config.url && config.url.includes('apibolsaprofesionales.hitpoly.com') && config.data && !(config.data instanceof URLSearchParams) && !(config.data instanceof FormData)) {
    const params = new URLSearchParams();
    Object.entries(config.data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, value);
      }
    });
    config.data = params;
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}