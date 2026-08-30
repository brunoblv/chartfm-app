import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { API_BASE_URL, getQueryParam } from "../lib/api";
import { tokenStorage } from "../lib/tokenStorage";
import { ApiError, apiRequest } from "../lib/apiClient";

const TOKEN_KEY = "chartfm_mobile_token";
/** Precisa bater com `scheme` do app.json e com o redirect final do backend. */
const AUTH_CALLBACK_URL = "chartfm://auth-callback";

export interface AuthUser {
  id: string;
  handle: string;
  name: string;
  email: string | null;
  image: string | null;
  needsHandle: boolean;
  role: "USER" | "ADMIN" | "DEV";
}

interface AuthContextValue {
  isLoading: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUser(accessToken: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/mobile/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("unauthorized");
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await tokenStorage.getItem(TOKEN_KEY);
        if (stored) {
          const fetchedUser = await fetchUser(stored);
          setToken(stored);
          setUser(fetchedUser);
        }
      } catch {
        await tokenStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const authUrl = `${API_BASE_URL}/api/auth/mobile/google/start`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, AUTH_CALLBACK_URL);

    if (result.type !== "success" || !result.url) {
      return { ok: false, error: result.type === "cancel" ? "cancelled" : "failed" };
    }

    const error = getQueryParam(result.url, "error");
    const accessToken = getQueryParam(result.url, "token");
    if (error || !accessToken) {
      return { ok: false, error: error ?? "missing_token" };
    }

    try {
      const fetchedUser = await fetchUser(accessToken);
      await tokenStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(fetchedUser);
      return { ok: true };
    } catch {
      return { ok: false, error: "profile_fetch_failed" };
    }
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiRequest<{ token: string; user: AuthUser }>("/api/auth/mobile/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      await tokenStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      const error = e instanceof ApiError ? e.message : "network_error";
      return { ok: false, error };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      await apiRequest<{ ok: true; emailSent: boolean }>("/api/auth/register", {
        method: "POST",
        auth: false,
        body: { name, email, password },
      });
      return { ok: true };
    } catch (e) {
      const error = e instanceof ApiError ? e.message : "network_error";
      return { ok: false, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    await tokenStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = await tokenStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    try {
      const fetchedUser = await fetchUser(stored);
      setUser(fetchedUser);
    } catch {
      // mantém o usuário atual em caso de falha passageira
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isSignedIn: Boolean(token),
      user,
      signInWithGoogle,
      signInWithPassword,
      register,
      signOut,
      refreshUser,
    }),
    [isLoading, token, user, signInWithGoogle, signInWithPassword, register, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
