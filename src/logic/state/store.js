import { create } from "zustand";
import { persist } from "zustand/middleware";

export const userStore = create(
  persist(
    (set) => ({
      user: null,
      login: (data) => set({ user: data }),
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user-storage");
        set({ user: null });
      }
    }),
    {
      name: "user-storage"
    }
  )
)