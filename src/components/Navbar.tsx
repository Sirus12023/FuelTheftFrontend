// src/components/Navbar.tsx
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

interface Props {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<Props> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Optional Sidebar Toggle (if needed) */}
      <div className="w-12">{/* space for sidebar toggle button if needed */}</div>

      {/* App Name */}
      <div className="text-center flex-1">
        <h1 className="text-2xl font-signord font-extrabold text-blue-700 dark:text-blue-300">
  FuelSafe
</h1>



      </div>

      {/*  Dark Mode Toggle */}
      <div className="w-12 flex justify-end">
        <button
          onClick={toggleDarkMode}
          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
