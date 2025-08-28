import { useRef, useEffect, useState } from "react";
import "../styles/DroneMap.css";
import { useMap } from "../hooks/useMapHook";
import "mapbox-gl/dist/mapbox-gl.css"; // Ensure Mapbox CSS is loaded globally

const DroneMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const {  getRedDroneCount } = useMap(mapContainer);
  const [redCount, setRedCount] = useState(0);


  // Update red drone counter every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRedCount(getRedDroneCount());
    }, 1000);
    return () => clearInterval(interval);
  }, [getRedDroneCount]);

  return (
<div className="map-wrapper">
  <div ref={mapContainer} className="drone-map-container" />
  <div className="red-drone-counter">Red drones: {redCount}</div>
</div>
  );
};

export default DroneMap;
