import { getCookie } from "cookies-next";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserStateType {
  isLoggedIn: boolean;
  setIsLoggedIn: (token: boolean) => void;
}

const useUserStore = create<UserStateType>()(
  devtools((set) => ({
    isLoggedIn: !!getCookie("accessToken"),
    setIsLoggedIn: (token) => set({ isLoggedIn: token }),
  }))
);

export default useUserStore;
