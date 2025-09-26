import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, register as registerApi, type RegisterPayload, type AuthUser, me as meApi } from "../api/auth";

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const stripTokenPrefix = (value: string) => {
  const lower = (value || "").toLowerCase();
  if (lower.startsWith("bearer ")) return value.slice(7).trim();
  if (lower.startsWith("token ")) return value.slice(6).trim();
  return value;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || "accessToken";
  const refreshKey = import.meta.env.VITE_REFRESH_TOKEN_KEY || "refreshToken";
  const roleKey = "userRole";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // If token exists, try to fetch user context; you may adjust to a richer profile endpoint
        const data = await meApi();
        // Partial user; keep email/username. Role unknown here; keep previous if any.
        const storedRole = localStorage.getItem(roleKey) || undefined;
        if (data?.id) localStorage.setItem("authUserId", String(data.id));
        setUser((prev) => ({
          id: data.id,
          email: data.email,
          username: data.username,
          role: prev?.role || storedRole || (prev?.role as any),
        }));
      } catch {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);
        localStorage.removeItem(roleKey);
        localStorage.removeItem("authUserId");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [tokenKey, refreshKey, roleKey]);

  const login = useCallback(async (email: string, password: string) => {
    const { access, refresh, user } = await loginApi(email, password);
    localStorage.setItem(tokenKey, stripTokenPrefix(access));
    localStorage.setItem(refreshKey, refresh);
    if (user?.role) localStorage.setItem(roleKey, String(user.role));
    if (user?.id) localStorage.setItem("authUserId", String(user.id));
    setUser(user);
    return user;
  }, [tokenKey, refreshKey, roleKey]);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerApi(payload);
    // After successful registration, prefer user to login; do not auto-login since API doesn't return tokens
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(roleKey);
    localStorage.removeItem("authUserId");
    setUser(null);
  }, [tokenKey, refreshKey, roleKey]);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
