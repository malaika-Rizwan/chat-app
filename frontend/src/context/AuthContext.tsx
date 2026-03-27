"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { userApi } from "@/lib/api";
import type { User } from "@/types/chat";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = (value: string | null) => {
    setTokenState(value);
    if (typeof window !== "undefined") {
      if (value) window.localStorage.setItem("token", value);
      else window.localStorage.removeItem("token");
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    const { data } = await userApi.get("/me");
    setUser(data.user ?? data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const t =
      typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    setTokenState(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchUser().catch(() => {
      logout();
    });
  }, [token]);

  const value = useMemo(
    () => ({ token, user, loading, setToken, fetchUser, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
