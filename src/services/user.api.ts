/* eslint-disable no-console */
import { type User } from "@/types/AuthType";
import instance from "./instance";

export const USER_TAG = ["user"];

export const getUser = async (): Promise<User | undefined> => {
  try {
    return await instance.GET<User>("/users/me", {
      next: {
        revalidate: 60 * 60 * 6, // 6시간
        tags: USER_TAG,
      },
    });
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    return undefined;
  }
};

export const patchUser = async (id: string, data: patchUserType): Promise<User | undefined> => {
  try {
    return await instance.PATCH<User>(`/users/${id}`, data);
  } catch (error) {
    console.error(`사용자 정보 수정 실패 (ID: ${id}):`, error);
    return undefined;
  }
};

interface patchUserType {
  name?: string;
  isAdmin?: boolean;
}
