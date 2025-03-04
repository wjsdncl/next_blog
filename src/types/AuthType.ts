import { type Post } from "@/types/BlogType";

export interface SignUpForm {
  email: string;
  name: string;
  password: string;
  passwordConfirm?: string;
}

export interface SignUpResponse {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignInForm {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  posts?: Post[];
  comments?: Comment[];
}
