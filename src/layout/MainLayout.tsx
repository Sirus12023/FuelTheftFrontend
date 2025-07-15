// layout/MainLayout.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaMoon, FaSun } from "react-icons/fa";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Apply or remove 'dark' class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-56 p-6 transition-all duration-300">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-md"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
};

export default MainLayout;
