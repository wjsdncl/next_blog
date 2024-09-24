import { getCookie } from "cookies-next";
import { create } from "zustand";

interface UserState {
  isLoggedIn: boolean;
  setIsLoggedIn: (token: boolean) => void;
}

const useUserStore = create<UserState>((set) => ({
  isLoggedIn: !!getCookie("accessToken"),
  setIsLoggedIn: (token) => set({ isLoggedIn: token }),
}));

export default useUserStore;
