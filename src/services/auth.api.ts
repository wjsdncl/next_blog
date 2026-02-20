/* eslint-disable no-console */
import { type OAuthResponse } from "@/types/authType";
import instance from "./instance";

export const loginWithGithub = async () => {
  try {
    window.location.href = "/api/auth/github";
  } catch (error) {
    console.error("깃허브 로그인 시도 실패:", error);
    throw error;
  }
};

export const handleOAuthCallback = async (code: string): Promise<OAuthResponse> => {
  try {
    return await instance.GET<OAuthResponse>(`/auth/github/callback?code=${code}`);
  } catch (error) {
    console.error("OAuth 로그인 실패:", error);
    throw error;
  }
};

export const getSession = async (): Promise<OAuthResponse | null> => {
  try {
    return await instance.GET<OAuthResponse>("/auth/session");
  } catch (error) {
    console.error("세션 조회 실패:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    return await instance.POST("/auth/logout");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    throw error;
  }
};
