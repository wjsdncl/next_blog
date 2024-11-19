"use client";

import axios from "axios";
import { getCookie } from "cookies-next";

const clientInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

clientInstance.interceptors.request.use(
  (config) => {
    const token = getCookie("accessToken") || "";
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default clientInstance;
