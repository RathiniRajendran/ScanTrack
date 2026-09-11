import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import { clearToken, getToken, setToken } from "../utils/tokenStorage";
import { useToast } from "../hooks/useToast";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session on load by validating any stored token against the API
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (cancelled) return;
        setUser(currentUser);
        setTokenState(storedToken);
      } catch {
        clearToken();
        if (cancelled) return;
        setUser(null);
        setTokenState(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      setToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
      showToast(`Welcome back, ${result.user.name}.`, "success");
    },
    [showToast]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authService.register(payload);
      setToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
      showToast("Account created successfully.", "success");
    },
    [showToast]
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: user !== null, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
