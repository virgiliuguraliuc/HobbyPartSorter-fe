import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);

useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme); // <html data-theme="dark">
  localStorage.setItem("theme", theme);
}, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
