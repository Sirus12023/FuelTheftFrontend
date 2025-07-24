// src/App.tsx
import "react-day-picker/dist/style.css";
import "leaflet/dist/leaflet.css"; // ✅ Ensure map components work correctly
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FuelTheft from "./pages/FuelTheft";
import BusEvents from "./pages/BusEvents";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/fuel-theft"
          element={
            <MainLayout>
              <FuelTheft />
            </MainLayout>
          }
        />
        <Route
          path="/bus-events"
          element={
            <MainLayout>
              <BusEvents />
            </MainLayout>
          }
        />
        {/* Optional: Add fallback route */}
        <Route
          path="*"
          element={
            <MainLayout>
              <div className="p-8 text-center text-red-500 text-lg font-semibold">
                404 – Page Not Found
              </div>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
