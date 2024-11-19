"use server";

import axios from "axios";
import { cookies } from "next/headers";

const serverInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

serverInstance.interceptors.request.use(
  (config) => {
    const token = cookies().get("accessToken")?.value ?? "";
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default serverInstance;
