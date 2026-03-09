export type UserRole = "USER" | "OWNER";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created_at: string;
}