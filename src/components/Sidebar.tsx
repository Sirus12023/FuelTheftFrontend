import React, { useState } from "react";
import {
  FaBars,
  FaHome,
  FaBusAlt,
  FaClipboardList,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: "/", label: "Dashboard", icon: <FaHome /> },
    { to: "/fuel-theft", label: "Fuel Theft", icon: <FaBusAlt /> },
    { to: "/bus-events", label: "Bus Events", icon: <FaClipboardList /> },
  ];

  return (
    <aside
      className={`h-screen fixed top-0 left-0 z-30 transition-all duration-300 shadow-lg ${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-to-b from-blue-100 to-blue-200 border-r border-blue-300`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-blue-600 hover:text-blue-800"
        >
          <FaBars className="text-xl" />
        </button>
        {!collapsed && (
          <h2 className="text-lg font-extrabold text-blue-700 tracking-tight">
            FuelSafe
          </h2>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="mt-6 px-2 space-y-2">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-md transition-all duration-200 group ${
                isActive
                  ? "bg-white text-blue-800 font-semibold shadow"
                  : "hover:bg-blue-50 hover:text-blue-700 text-blue-600"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {!collapsed && (
              <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">
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
