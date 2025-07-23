// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldEnableDark = saved === "true" || (!saved && prefersDark);

    setDarkMode(shouldEnableDark);
    document.documentElement.classList.toggle("dark", shouldEnableDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next.toString());
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#e0f2fe] to-[#f0f9ff] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed((prev) => !prev)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
