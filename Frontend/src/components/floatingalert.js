import React, { useState, useEffect } from "react";

const FloatingAlert = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      className={`floating-alert ${type}${isVisible ? " show" : ""}`}
      style={{
        position: "fixed",
        top: "10px",
        left: "60%",
        transform: "translateX(-50%)",
        backgroundColor: isVisible ? "red" : "transparent",
        color: isVisible ? "white" : "transparent",
        borderRadius: "5px",
        boxShadow: isVisible ? "0px 2px 5px rgba(0, 0, 0, 0.2)" : "none",
        zIndex: "9999",
        display: "block",
        width: "300px",
        textAlign: "center",
        padding: "10px",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      {message}
    </div>
  );
};

export default FloatingAlert;
