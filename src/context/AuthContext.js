import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext(null);

const GUILDS_TTL_MS = 5 * 60 * 1000;
let guildsMemory = null; // { userId, guilds, fetchedAt }
let guildsInflight = null;

async function requestGuilds(force = false) {
  if (!force && guildsMemory && Date.now() - guildsMemory.fetchedAt < GUILDS_TTL_MS) {
    return { guilds: guildsMemory.guilds, cached: true };
  }
  if (!force && guildsInflight) return guildsInflight;

  const url = force ? "/api/auth/guilds?refresh=1" : "/api/auth/guilds";
  guildsInflight = (async () => {
    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Could not load guilds");
      err.status = res.status;
      err.retryAfter = data.retryAfter;
      throw err;
    }
    guildsMemory = {
      userId: null,
      guilds: data.guilds || [],
      fetchedAt: Date.now(),
    };
    return { guilds: guildsMemory.guilds, cached: Boolean(data.cached) };
  })().finally(() => {
    guildsInflight = null;
  });

  return guildsInflight;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guilds, setGuilds] = useState([]);
  const [guildsLoading, setGuildsLoading] = useState(false);
  const [guildsError, setGuildsError] = useState(null);
  const userIdRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();
      const nextUser = data?.session?.user ?? null;
      setUser(nextUser);
      userIdRef.current = nextUser?.id ?? null;
      if (!nextUser) {
        guildsMemory = null;
        setGuilds([]);
        setGuildsError(null);
      } else if (guildsMemory && guildsMemory.userId && guildsMemory.userId !== nextUser.id) {
        guildsMemory = null;
        setGuilds([]);
      } else if (guildsMemory?.guilds) {
        guildsMemory.userId = nextUser.id;
        setGuilds(guildsMemory.guilds);
      }
    } catch {
      setUser(null);
      userIdRef.current = null;
      setGuilds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadGuilds = useCallback(async (force = false) => {
    if (!userIdRef.current && !force) {
      // Wait until session known — callers typically gate on user
    }
    setGuildsLoading(true);
    setGuildsError(null);
    try {
      const result = await requestGuilds(force);
      if (userIdRef.current) {
        guildsMemory = {
          userId: userIdRef.current,
          guilds: result.guilds,
          fetchedAt: Date.now(),
        };
      }
      setGuilds(result.guilds);
      return result.guilds;
    } catch (error) {
      setGuildsError(error.message || "Could not load guilds");
      if (!guildsMemory?.guilds?.length) setGuilds([]);
      throw error;
    } finally {
      setGuildsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  const logout = useCallback(() => {
    guildsMemory = null;
    window.location.href = "/api/auth/logout";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
        guilds,
        guildsLoading,
        guildsError,
        loadGuilds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
