import mapboxgl from "mapbox-gl";
import type { DroneWithPath } from "../types/drone";
import { flightTracker } from "./flightTracker";

// initialize the map
export const initializeMap = (
  container: HTMLDivElement, 
  defaultLat: number, 
  defaultLng: number
): mapboxgl.Map => {
  const map = new mapboxgl.Map({
    container,
    style: "mapbox://styles/mapbox/dark-v10",
    center: [defaultLng, defaultLat],
    zoom: 12,
  });

  map.addControl(new mapboxgl.NavigationControl(), "bottom-left");
  return map;
};

// Create popup content for a drone
export const createPopupContent = (drone: DroneWithPath, registration: string): string => {
  const flightTime = flightTracker.getFlightTime(registration);
  
  return `
    <div class="popup-content">
      <h2 class="popup-title">${drone.properties.Name}</h2>
      <div class="popup-info">
        <div class="popup-section">
          <span>Altitude</span>
          <span>${drone.properties.altitude}m</span>
        </div>
        <div class="popup-section">
          <span>Flight Time</span>
          <span>${flightTime}</span>
        </div>
      </div>
    </div>
  `;
};

// Update drone path on the map
export const updateDronePath = (
  map: mapboxgl.Map, 
  drone: DroneWithPath
): void => {
  if (drone.path.length <= 1) return;

  const sourceId = `path-${drone.serial}`;
  const layerId = `line-${drone.serial}`;
  const allowedToFly = drone.properties.registration.split("-")[1]?.[0]?.toUpperCase() === "B";
  const color = allowedToFly ? "#24ff00" : "#ff0000";

  const lineGeoJson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: drone.path
    },
    properties: {} 
  };

  try {
    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(lineGeoJson);
    } else {
      map.addSource(sourceId, { type: "geojson", data: lineGeoJson });
      map.addLayer({ 
        id: layerId, 
        type: "line", 
        source: sourceId, 
        paint: { "line-color": color, "line-width": 3 } 
      });
    }
  } catch (error) {
    console.error('Error updating path:', error);
  }
};