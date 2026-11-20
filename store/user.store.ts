import { create } from "zustand";

import type { TUser } from "@/types/auth";

type TUserStore = {
  user: TUser | null;
  setUser: (user: TUser | null) => void;
};

export const useUserStore = create<TUserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
