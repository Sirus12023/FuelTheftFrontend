import React from "react";
import {
  FaBars,
  FaHome,
  FaBusAlt,
  FaClipboardList,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapsed }) => {
  const links = [
    { to: "/", label: "Dashboard", icon: <FaHome /> },
    { to: "/fuel-theft", label: "Fuel Theft", icon: <FaBusAlt /> },
    { to: "/bus-events", label: "Bus Events", icon: <FaClipboardList /> },
  ];

  return (
    <aside
      className={`h-screen fixed top-0 left-0 z-30 transition-all duration-300 shadow-lg ${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-to-b from-[#1e3a8a] to-[#2563eb] border-r border-blue-900`}
    >
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={toggleCollapsed}
          className="text-white hover:text-yellow-300"
        >
          <FaBars className="text-xl" />
        </button>
      </div>

      <nav className="mt-6 px-2 space-y-2">
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

  {/* Label (expanded) */}
  {!collapsed && (
    <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">
      {label}
    </span>
  )}

  {/* Tooltip (collapsed + hover) */}
  {collapsed && (
    <span className="absolute left-full ml-2 whitespace-nowrap bg-white dark:bg-gray-900 text-black dark:text-white text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
      {label}
    </span>
  )}
</NavLink>


        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
