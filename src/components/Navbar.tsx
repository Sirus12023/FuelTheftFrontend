// src/components/Navbar.tsx
import React from "react";
import upsrtc from "../assets/upsrtc.png"; // ✅ UPSRTC logo



const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] shadow-md px-4 py-3 flex items-center justify-between">
      {/* Left: Placeholder for spacing */}
      <div className="w-48 flex items-center gap-4">
        {/* You can optionally show a small logo here if desired */}
      </div>

      {/* Center: App Title */}
      <div className="text-center flex-1">
        <h1 className="text-2xl font-signord font-extrabold text-white">
          FuelSafe
        </h1>
      </div>

      {/* Right: UPSRTC Logo */}
      <div className="flex items-center gap-4">
        <img
  src={upsrtc}
  alt="UPSRTC"
  className="h-12 max-h-12 w-auto object-contain"
  title="UPSRTC"
/>

      </div>
    </header>
  );
};

export default Navbar;
