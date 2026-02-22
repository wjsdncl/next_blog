/* eslint-disable no-console */
import { type User } from "@/types/authType";
import instance from "./instance";

export const USER_KEYS = ["user"] as const;

export const getUser = async (): Promise<User | undefined> => {
  try {
    return await instance.GET<User>("/users/me", {
      next: {
        revalidate: 60 * 60 * 6,
        tags: [...USER_KEYS],
      },
    });
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    return undefined;
  }
};
