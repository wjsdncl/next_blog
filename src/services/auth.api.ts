/* eslint-disable no-console */
import { type SignInForm, type SignInResponse, type SignUpForm } from "@/types/AuthType";
import instance from "./instance";

// 회원가입
export const SignUp = async (formData: SignUpForm) => {
  try {
    return await instance.POST(`/auth/signup`, formData);
  } catch (error) {
    console.error("회원가입 실패:", error);
    throw error;
  }
};

// 로그인
export const SignIn = async (formData: SignInForm): Promise<SignInResponse> => {
  try {
    return await instance.POST<SignInResponse>(`/auth/login`, formData);
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

// 깃허브 로그인
export const SignInWithGithub = async () => {
  try {
    window.location.href = "https://blog-api-xhk1.onrender.com/auth/github";
  } catch (error) {
    console.error("깃허브 로그인 시도 실패:", error);
    throw error;
  }
};

// 깃허브 로그인 콜백
export const SignInWithGithubCallback = async (code: string): Promise<SignInResponse> => {
  try {
    return await instance.GET<SignInResponse>(`/auth/github/callback?code=${code}`);
  } catch (error) {
    console.error("깃허브 로그인 실패:", error);
    throw error;
  }
};
