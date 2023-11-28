import React, { useState, useEffect } from "react";

const FloatingAlert = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      className={`floating-alert ${type}${isVisible ? " show" : ""}`}
      style={{
        position: "fixed",
        top: "10px",
        right: "15px",
        backgroundColor: "red",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
        zIndex: "9999",
        display: "block",
      }}
    >
      {message}
    </div>
  );
};

export default FloatingAlert;
