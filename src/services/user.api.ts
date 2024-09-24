import instance from "./axios";
import { User } from "@/types/authType";

export const getUser = async (): Promise<User> => {
  const response = await instance.get<User>("/users/me");
  return response.data;
};

export const patchUser = async (id: string, data: patchUserType) => {
  return await instance.patch(`/users/${id}`, data);
};

interface patchUserType {
  name?: string;
  isAdmin?: boolean;
}
