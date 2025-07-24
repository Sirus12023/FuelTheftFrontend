import React from "react";
import {
  FaHome,
  FaBusAlt,
  FaClipboardList,
  FaSun,
  FaMoon,
  FaBars,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import logoFull3 from "../assets/logoFull3.png";
import logoIcon4 from "../assets/logoIcon4.png";

// Sidebar does not require backend data as per current backend design.
// If backend provides organization name, logo, or navigation structure in future, update here accordingly.

interface SidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  toggleCollapsed,
  darkMode,
  toggleDarkMode,
}) => {
  // Navigation links are static as per current backend design.
  // If backend provides navigation structure, update this accordingly.
  const links = [
    { to: "/", label: "Dashboard", icon: <FaHome /> },
    { to: "/fuel-theft", label: "Fuel Theft", icon: <FaBusAlt /> },
    { to: "/bus-events", label: "Bus Events", icon: <FaClipboardList /> },
  ];

  return (
    <aside
      className={`h-screen fixed top-0 left-0 z-30 transition-all duration-300 shadow-lg overflow-hidden ${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-to-b from-[#1e3a8a] to-[#2563eb] border-r border-blue-900 flex flex-col`}
    >
      {/* Header: Logo + Collapse */}
      <div
        className={`p-4 ${
          collapsed
            ? "flex flex-col items-center gap-3"
            : "flex items-center justify-between"
        }`}
      >
        {collapsed ? (
          <img
            src={logoIcon4}
            alt="Logo Icon"
            className="h-12 max-h-12 w-auto object-contain"
          />
        ) : (
          <img
            src={logoFull3}
            alt="Logo"
            className="h-12 max-h-12 w-auto object-contain"
          />
        )}

        <div className="relative group">
          <button
            onClick={toggleCollapsed}
            aria-label="Toggle Sidebar"
            className="text-white hover:text-yellow-300 mt-1"
          >
            <FaBars className="text-2xl" />
          </button>
          {collapsed && (
            <span className="absolute left-full ml-2 whitespace-nowrap bg-white dark:bg-gray-900 text-black dark:text-white text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Expand
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6 px-2 space-y-2 flex-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `relative group flex items-center ${
                collapsed ? "justify-center" : "gap-4"
              } p-3 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {!collapsed && (
              <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">
                {label}
              </span>
            )}
            {collapsed && (
              <span className="absolute left-full ml-2 whitespace-nowrap bg-white dark:bg-gray-900 text-black dark:text-white text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-4">
        <div
          role="button"
          aria-label="Toggle Dark Mode"
          onClick={toggleDarkMode}
          className={`relative group flex items-center ${
            collapsed ? "justify-center" : "gap-2"
          } text-white hover:text-yellow-200 cursor-pointer`}
        >
          {darkMode ? (
            <FaSun className="text-lg" />
          ) : (
            <FaMoon className="text-lg" />
          )}
          {!collapsed && (
            <span className="text-sm">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          )}
          {collapsed && (
            <span className="absolute left-full ml-2 whitespace-nowrap bg-white dark:bg-gray-900 text-black dark:text-white text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
