import { getCookie } from "cookies-next";
import { create } from "zustand";

interface UserStateType {
  isLoggedIn: boolean;
  setIsLoggedIn: (token: boolean) => void;
}

const useUserStore = create<UserStateType>((set) => ({
  isLoggedIn: !!getCookie("accessToken"),
  setIsLoggedIn: (token) => set({ isLoggedIn: token }),
}));

export default useUserStore;
