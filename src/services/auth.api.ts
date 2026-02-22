/* eslint-disable no-console */
import { type OAuthResponse } from "@/types/authType";
import instance from "./instance";

export const loginWithGithub = async () => {
  try {
    window.location.href = "/api/auth/oauth?type=github";
  } catch (error) {
    console.error("깃허브 로그인 시도 실패:", error);
    throw error;
  }
};

export const handleOAuthCallback = async (code: string): Promise<OAuthResponse> => {
  try {
    return await instance.GET<OAuthResponse>(`/auth/oauth/callback?code=${code}`);
  } catch (error) {
    console.error("OAuth 로그인 실패:", error);
    throw error;
  }
};
