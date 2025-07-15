// src/layout/MainLayout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto transition-all ml-16 md:ml-56 p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
