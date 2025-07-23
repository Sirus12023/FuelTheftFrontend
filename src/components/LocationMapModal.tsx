// src/components/LocationMapModal.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Dialog } from "@headlessui/react";

interface Props {
  lat: number;
  long: number;
  isOpen: boolean;
  onClose: () => void;
}

const LocationMapModal: React.FC<Props> = ({ lat, long, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />rm
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">📍 Alert Location</h2>
            <div className="h-[300px] rounded overflow-hidden">
              <MapContainer center={[lat, long]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, long]}>
                  <Popup>
                    Latitude: {lat.toFixed(4)}, Longitude: {long.toFixed(4)}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LocationMapModal;
