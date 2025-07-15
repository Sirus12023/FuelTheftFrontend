// components/Sidebar.tsx
import React, { useState } from "react";
import { FaBars, FaHome, FaBusAlt, FaClipboardList } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: "/", label: "Dashboard", icon: <FaHome /> },
    { to: "/fuel-theft", label: "Fuel Theft", icon: <FaBusAlt /> },
    { to: "/bus-events", label: "Bus Events", icon: <FaClipboardList /> },
  ];

  return (
    <div
      className={`bg-white shadow-md h-screen fixed top-0 left-0 z-20 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Header / Toggle */}
      <div className="p-4 flex justify-between items-center">
        <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
          <FaBars className="text-xl text-blue-600" />
        </button>
        {!collapsed && <h2 className="text-lg font-bold text-blue-600">FuelSafe</h2>}
      </div>

      {/* Navigation Links */}
      <nav className="mt-8 space-y-2 px-2">
        {links.map(({ to, label, icon }) => (
          <NavLink
            to={to}
            key={label}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-md transition hover:bg-blue-100 ${
                isActive ? "bg-blue-100 text-blue-600" : "text-gray-600"
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
