"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { AuthUser } from "./types";
import { api } from "./api";

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    organizationId: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

const DEFAULT_GUEST_USER: AuthUser = {
  id: "6aabb0000000000000000001",
  email: "surveyor@prism.cadastral",
  fullName: "Cadastral Surveyor",
  role: "admin",
  organizationId: "6aab9081c37fa4af01c3541c",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_GUEST_USER,
  isHydrated: true,

  hydrate: () => {
    const raw = Cookies.get("prism_user");
    set({ user: raw ? (JSON.parse(raw) as AuthUser) : DEFAULT_GUEST_USER, isHydrated: true });
  },

  login: async (email, password) => {
    const res: any = await api.post("/auth/login", { email, password });
    const payload = res?.data ?? res;
    const accessToken = payload?.accessToken;
    const refreshToken = payload?.refreshToken;
    const user = payload?.user;

    if (accessToken) {
      Cookies.set("prism_access_token", accessToken, { expires: 1 });
    }
    if (refreshToken) {
      Cookies.set("prism_refresh_token", refreshToken, { expires: 7 });
    }
    if (user) {
      Cookies.set("prism_user", JSON.stringify(user), { expires: 7 });
    }
    set({ user: user ?? null });
  },

  register: async (payload) => {
    const res: any = await api.post("/auth/register", payload);
    const data = res?.data ?? res;
    const accessToken = data?.accessToken;
    const refreshToken = data?.refreshToken;
    const user = data?.user;

    if (accessToken) {
      Cookies.set("prism_access_token", accessToken, { expires: 1 });
    }
    if (refreshToken) {
      Cookies.set("prism_refresh_token", refreshToken, { expires: 7 });
    }
    if (user) {
      Cookies.set("prism_user", JSON.stringify(user), { expires: 7 });
    }
    set({ user: user ?? null });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the server call fails, clear the local session below.
    }
    Cookies.remove("prism_access_token");
    Cookies.remove("prism_refresh_token");
    Cookies.remove("prism_user");
    set({ user: null });
  },
}));
