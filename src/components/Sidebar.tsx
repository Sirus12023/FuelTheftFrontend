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
      className={`h-screen fixed top-0 left-0 z-20 transition-all duration-300 shadow-xl border-r border-blue-100 bg-gradient-to-b from-white to-blue-50 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => setCollapsed(!collapsed)} className="text-blue-600 hover:text-blue-800">
          <FaBars className="text-xl" />
        </button>
        {!collapsed && (
          <h2 className="text-lg font-extrabold text-blue-700 tracking-tight">
            FuelSafe
          </h2>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="mt-8 px-2 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold shadow-inner"
                  : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
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
