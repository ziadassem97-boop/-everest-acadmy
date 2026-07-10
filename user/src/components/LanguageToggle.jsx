import React from "react";
import { useLang } from "../LangContext";

export default function LanguageToggle({ minimal }) {
  const { lang, toggle } = useLang();
  if (minimal) {
    return (
      <button onClick={toggle} style={{background:"#2563ff",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
        {lang === "ar" ? "EN" : "عربي"}
      </button>
    );
  }
  return (
    <div className="lang-toggle" onClick={toggle} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 10px",borderRadius:8,background:"#2563ff",border:"none",fontSize:13,fontWeight:600,color:"#fff"}}>
      <span style={{opacity:lang==="ar"?1:0.5}}>العربية</span>
      <span style={{fontSize:11,opacity:0.5}}>|</span>
      <span style={{opacity:lang==="en"?1:0.5}}>English</span>
    </div>
  );
}
