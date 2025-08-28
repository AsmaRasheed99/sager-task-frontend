import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useDrone } from "../hooks/useDrone";
import { flightTracker } from "../util/flightTracker";
import {
  initializeMap,
  updateDronePath,
  createPopupContent,
} from "../util/mapUtils";
import droneIcon from "../assets/drone.svg";
import type { DroneWithPath } from "../types/drone";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const useMap = (
  mapContainer: React.RefObject<HTMLDivElement | null>
) => {
  const { drones, selectedDrone, setSelectedDrone } = useDrone();
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const updateInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitialized = useRef(false);
  const hasUnmounted = useRef(false); 

  const defaultLat = 31.890411;
  const defaultLng = 35.963934;

  const cleanup = () => {
    if (hasUnmounted.current) return;
    hasUnmounted.current = true;

    console.log("Cleaning up DroneMap...");
    if (updateInterval.current) clearInterval(updateInterval.current);

    Object.values(markers.current).forEach((m) => m.remove());
    markers.current = {};

    if (map.current) map.current.remove();
    map.current = null;

    isInitialized.current = false;
  };
  const getRedDroneCount = (): number => {
    return drones.filter((drone) => {
      const registration = drone.properties.registration;
      const allowedToFly =
        registration.split("-")[1]?.[0]?.toUpperCase() === "B";
      return !allowedToFly; 
    }).length;
  };

  // initialize map
  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;

    try {
      map.current = initializeMap(mapContainer.current, defaultLat, defaultLng);

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        isInitialized.current = true;
      });

      map.current.on("error", (e) => console.error("Map error:", e));

      // update drone popups periodically
      updateInterval.current = setInterval(() => {
        if (!map.current || !isInitialized.current) return;

        flightTracker.getActiveDrones().forEach((reg) => {
          const drone = drones.find((d) => d.properties.registration === reg);
          if (drone && markers.current[reg]?.getPopup()?.isOpen()) {
            const popupContent = createPopupContent(drone, reg);
            markers.current[reg].getPopup()?.setHTML(popupContent);
          }
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return cleanup; 
  }, []);

  // Update drones on map
  useEffect(() => {
    if (!map.current || !isInitialized.current || !drones) return;

    const updateDrones = () => {
      drones.forEach((drone) => {
        if (!drone.path || drone.path.length === 0) return;

        const registration = drone.properties.registration;
        const allowedToFly =
          registration.split("-")[1]?.[0]?.toUpperCase() === "B";
        const color = allowedToFly ? "#24ff00" : "#ff0000";

        if (drone.properties.altitude > 0) {
          flightTracker.startFlight(registration);
        } else {
          flightTracker.stopFlight(registration);
        }

        const [lng, lat] = drone.path[drone.path.length - 1];

        updateDronePath(map.current!, drone);

        const marker = markers.current[registration];
        if (!marker) {
          createMarker(drone, lng, lat, color);
        } else {
          updateMarker(marker, drone, lng, lat, color);
        }
      });
    };

    if (!map.current.isStyleLoaded()) {
      const checkLoaded = () => {
        if (map.current?.isStyleLoaded()) updateDrones();
        else setTimeout(checkLoaded, 100);
      };
      checkLoaded();
    } else {
      updateDrones();
    }
  }, [drones, setSelectedDrone]);

  // fly to selected drone
  useEffect(() => {
    if (!selectedDrone || selectedDrone.length === 0 || !map.current) return;

    const lastCoord = selectedDrone[selectedDrone.length - 1];
    if (!lastCoord || lastCoord.length < 2) return;

    const [lng, lat] = lastCoord;
    map.current.flyTo({ center: [lng, lat], zoom: 15 });
  }, [selectedDrone]);

  const createMarker = (
    drone: DroneWithPath,
    lng: number,
    lat: number,
    color: string
  ) => {
    const registration = drone.properties.registration;

    const el = document.createElement("div");
    el.className = "drone-marker";
    el.style.backgroundColor = color;
    el.style.transform = `rotate(${drone.properties.yaw || 0}deg)`;

    const img = document.createElement("img");
    img.src = droneIcon;
    img.alt = "drone";
    el.appendChild(img);

    el.addEventListener("click", () => setSelectedDrone(drone.path));

    const marker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current!);

    const popupContent = createPopupContent(drone, registration);
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);
    marker.setPopup(popup);

    markers.current[registration] = marker;
  };

  const updateMarker = (
    marker: mapboxgl.Marker,
    drone: DroneWithPath,
    lng: number,
    lat: number,
    color: string
  ) => {
    try {
      marker.setLngLat([lng, lat]);
      const el = marker.getElement();
      if (el) {
        el.style.backgroundColor = color;
        el.style.transform = `rotate(${drone.properties.yaw || 0}deg)`;
      }
    } catch (error) {
      console.error("Error updating marker:", error);
    }
  };

return { cleanup, getRedDroneCount };
};
