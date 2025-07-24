// components/BusSelector.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  selectedBus: string | null;
  setSelectedBus: (bus: string | null) => void;
}

const BusSelector: React.FC<Props> = ({
  search,
  setSearch,
  selectedBus,
  setSelectedBus,
}) => {
  const [busList, setBusList] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get<{ id: string; registrationNo: string }[]>(
          "/vehicles"
        );
        const buses = res.data || [];
        const regNos = buses.map((bus) => bus.registrationNo);
        setBusList(regNos);
      } catch (err) {
        console.error("Error fetching buses:", err);
      }
    };

    fetchBuses();
  }, []);

  const filtered = search.length === 0
    ? []
    : busList.filter((bus) =>
        bus.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700 space-y-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
        Select Bus
      </label>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedBus(null);
            setShowSuggestions(true);
          }}
          placeholder="Search by bus number..."
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filtered.length > 0 && showSuggestions && (
          <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 mt-1 rounded-md shadow-md max-h-48 overflow-y-auto">
            {filtered.map((bus) => (
              <li
                key={bus}
                onClick={() => {
                  setSelectedBus(bus);
                  setSearch(bus);
                  setShowSuggestions(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-sm"
              >
                {bus}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedBus ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Selected: <span className="font-medium">{selectedBus}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">No bus selected</p>
      )}
    </section>
  );
};

export default BusSelector;
