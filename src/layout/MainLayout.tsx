import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initial load - check saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldEnableDark = saved === "true" || (!saved && prefersDark);

    setDarkMode(shouldEnableDark);
    if (shouldEnableDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode on button click
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
      />

      <div className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
