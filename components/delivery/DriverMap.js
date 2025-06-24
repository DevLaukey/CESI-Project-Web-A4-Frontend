import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const DriverMap = ({ driverLocation }) => {
  const [location, setLocation] = useState(
    driverLocation || { lat: 51.505, lng: -0.09 }
  ); // Default location if no driver position
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (driverLocation) {
      setLocation(driverLocation);
    }
  }, [driverLocation]);

  return (
    <MapContainer
      center={location}
      zoom={zoom}
      style={{
        width: "100%", // Full width of the container
        height: "300px", // Smaller height
        borderRadius: "8px", // Optional: Adds rounded corners for better visual appeal
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", // Optional: Adds a subtle shadow effect
      }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={location}>
        <Popup>Driver is here</Popup>
      </Marker>
    </MapContainer>
  );
};

export default DriverMap;
