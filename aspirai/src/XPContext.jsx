// XPContext.jsx
import React, { createContext, useContext, useState } from "react";

const XPContext = createContext();

export const useXP = () => useContext(XPContext);

export const XPProvider = ({ children }) => {
  const [xp, setXp] = useState(0);

  const addXP = (points) => setXp(prev => prev + points);

  return (
    <XPContext.Provider value={{ xp, addXP }}>
      {children}
    </XPContext.Provider>
  );
};