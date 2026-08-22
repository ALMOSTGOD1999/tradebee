import { useState, useEffect, useCallback } from "react";
import type { User } from "./store";
import {
  initializeDB,
  loginUser,
  getUser,
} from "./server-actions";

const CURRENT_USER_KEY = "tb_current_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB();
      } catch {
        // DB init failed, continue
      }
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as User;
          const fresh = await getUser({ data: { id: parsed.id } });
          if (fresh) {
            setUser(fresh);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh));
          } else {
            localStorage.removeItem(CURRENT_USER_KEY);
          }
        } catch {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const fresh = await getUser({ data: { id: user.id } });
    if (fresh) {
      setUser(fresh);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh));
    }
  }, [user]);

  return { user, login, logout, isLoading, refreshUser };
}
