// src/components/FuelStatsGrid.tsx

import React from "react";

interface FuelUsageStats {
  totalFuelConsumed: number;
  totalFuelStolen: number;
  totalFuelRefueled: number;
  distanceTravelled: number;
  fuelEfficiency: number;
}

interface Props {
  stats: FuelUsageStats;
}

const FuelStatsGrid: React.FC<Props> = ({ stats }) => {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fuel Consumed</h4>
        <p className="text-xl font-semibold text-blue-600 dark:text-blue-300">{stats.totalFuelConsumed.toFixed(2)} L</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Stolen</h4>
        <p className="text-xl font-semibold text-red-600 dark:text-red-300">{stats.totalFuelStolen.toFixed(2)} L</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Refueled</h4>
        <p className="text-xl font-semibold text-green-600 dark:text-green-300">{stats.totalFuelRefueled.toFixed(2)} L</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Distance Travelled</h4>
        <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-300">{stats.distanceTravelled.toFixed(2)} km</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Efficiency</h4>
        <p className="text-xl font-semibold text-purple-600 dark:text-purple-300">{stats.fuelEfficiency.toFixed(2)} km/L</p>
      </div>
    </div>
  );
};

export default FuelStatsGrid;
