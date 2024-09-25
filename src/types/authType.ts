import { Post } from "./blogType";

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
  accessToken: string;
  refreshToken: string;
  user: User;
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
