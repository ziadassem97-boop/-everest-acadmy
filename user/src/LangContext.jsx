import React, { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("everest_lang") || "ar");
  const toggle = () => setLang((l) => { const n = l === "ar" ? "en" : "ar"; localStorage.setItem("everest_lang", n); return n; });
  const t = (ar, en) => lang === "ar" ? ar : en;
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.style.transition = "all 0.3s ease";
  }, [dir, lang]);

  return <LangContext.Provider value={{ lang, toggle, t, dir }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
