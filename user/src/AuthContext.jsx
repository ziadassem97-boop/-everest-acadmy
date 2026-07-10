import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const d = localStorage.getItem("everest_user");
      if (!d) return null;
      const u = JSON.parse(d);
      const st = localStorage.getItem("everest_session_token");
      if (st) u.session_token = st;
      return u;
    } catch { return null; }
  });

  const login = (u, sessionToken) => {
    const userData = { ...u, session_token: sessionToken || u.session_token };
    setUser(userData);
    localStorage.setItem("everest_user", JSON.stringify(userData));
    localStorage.setItem("everest_session_token", userData.session_token);
  };
  const logout = () => { setUser(null); localStorage.removeItem("everest_user"); localStorage.removeItem("everest_session_token"); };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
