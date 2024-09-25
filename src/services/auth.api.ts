import instance from "./axios";
import { SignInForm, SignInResponse, SignUpForm } from "@/types/authType";

// 회원가입
export const SignUp = async (formData: SignUpForm) => {
  return await instance.post(`/auth/signup`, formData);
};

// 로그인
export const SignIn = async (formData: SignInForm): Promise<SignInResponse> => {
  return (await instance.post<SignInResponse>(`/auth/login`, formData)).data;
};
