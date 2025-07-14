// layout/MainLayout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-56 p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
