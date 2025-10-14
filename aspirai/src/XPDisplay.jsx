import React, { useEffect, useState } from "react";
import { useXP } from "./XPContext";
import { useLocation } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const XPDisplay = () => {
  const { xp } = useXP();
  const location = useLocation();
  const [displayXP, setDisplayXP] = useState(xp);

  useEffect(() => {
    if (xp > displayXP) {
      const interval = setInterval(() => {
        setDisplayXP(prev => {
          if (prev + 1 >= xp) {
            clearInterval(interval);
            return xp;
          }
          return prev + 1;
        });
      }, 50);
    }
  }, [xp, displayXP]);

  if (location.pathname === "/") return null; // hide on login

  return (
    <div style={styles.container}>
      <FaStar style={styles.icon} />
      <span style={styles.text}>{displayXP} XP</span>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: 20,
    right: 20,
    background: "linear-gradient(135deg, #2142adff 0%, #f4f6fcff 100%)",
    padding: "10px 16px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "16px",
    animation: "float 2s ease-in-out infinite",
    zIndex: 1000,
  },
  icon: { marginRight: 8, fontSize: "20px" },
  text: { letterSpacing: "1px" },
};

// Floating animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}`, styleSheet.cssRules.length);

export default XPDisplay;