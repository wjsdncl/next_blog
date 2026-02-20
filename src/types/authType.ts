export type UserRole = "USER" | "OWNER";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OAuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
