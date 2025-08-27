import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDrone } from "../hooks/useDrone";
import droneIcon from "../assets/drone.svg";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNtYTR0NiIsImEiOiJjbWVxdm05ZW0wMDN1MmpzZGt0aGIwMGR6In0.jFfAu9nQB7jlW-fJsfI15A";

// flight time tracker
const flightTracker = {
  activeDrones: new Map<string, Date>(),
  startFlight(registration: string) {
    if (!this.activeDrones.has(registration)) this.activeDrones.set(registration, new Date());
  },
  stopFlight(registration: string) {
    this.activeDrones.delete(registration);
  },
  getFlightTime(registration: string) {
    const start = this.activeDrones.get(registration);
    if (!start) return "00:00:00";
    const diff = new Date().getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  },
  getActiveDrones() {
    return Array.from(this.activeDrones.keys());
  },
};

const DroneMap = () => {
  const { drones } = useDrone();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  const defaultLat = 31.890411;
  const defaultLng = 35.963934;

  // update popup content
  const updatePopupContent = (registration: string, drone: any) => {
    const marker = markers.current[registration];
    if (!marker) return;
    const flightTime = flightTracker.getFlightTime(registration);
    const popupContent = `
      <div style="display: flex; flex-direction: column;">
        <h2>${drone.properties.Name}</h2>
        <div style="display: flex; flex-direction: row; gap: 20px;">
          <div style="display: flex; flex-direction: column;">
            <span>Altitude</span>
            <span>${drone.properties.altitude}m</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span>Flight Time</span>
            <span>${flightTime}</span>
          </div>
        </div>
      </div>
    `;
    marker.getPopup()?.setHTML(popupContent);
  };

  // initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [defaultLng, defaultLat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-left");

    // custom popup CSS
    const popupStyle = document.createElement("style");
    popupStyle.innerHTML = `
      .mapboxgl-popup-content {
        background: black !important;
        color: white !important;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
      }
      .mapboxgl-popup-tip {
        border-top-color: black !important;
        border-bottom-color: black !important;
      }
    `;
    document.head.appendChild(popupStyle);

    // update popups 
    updateInterval.current = setInterval(() => {
      flightTracker.getActiveDrones().forEach((reg) => {
        const drone = drones.find((d) => d.properties.registration === reg);
        if (drone && markers.current[reg]?.getPopup()?.isOpen()) updatePopupContent(reg, drone);
      });
    }, 1000);

    return () => {
      map.current?.remove();
      if (updateInterval.current) clearInterval(updateInterval.current);
    };
  }, []);

  // update drones on map
  useEffect(() => {
    if (!map.current || !drones) return;

    drones.forEach((drone) => {
      const registration = drone.properties.registration;
      const allowedToFly = registration.split("-")[1]?.[0]?.toUpperCase() === "B";
      const color = allowedToFly ? "#24ff00" : "#ff0000";

      // flight tracking
      if (drone.properties.altitude > 0) flightTracker.startFlight(registration);
      else flightTracker.stopFlight(registration);

      const [lng, lat] = drone.path[drone.path.length - 1];

      // update path
      if (drone.path.length > 1) {
        const sourceId = `path-${drone.serial}`;
        const layerId = `line-${drone.serial}`;
        const lineGeoJson = { type: "Feature", geometry: { type: "LineString", coordinates: drone.path } };

        if (map.current.getSource(sourceId)) {
          (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(lineGeoJson);
        } else {
          map.current.addSource(sourceId, { type: "geojson", data: lineGeoJson });
          map.current.addLayer({ id: layerId, type: "line", source: sourceId, paint: { "line-color": color, "line-width": 3 } });
        }
      }

      // Update or create marker with yaw rotation
      let marker = markers.current[registration];
      if (!marker) {
        const el = document.createElement("div");
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = color;
        el.style.border = "2px solid white";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";

        const img = document.createElement("img");
        img.src = droneIcon;
        img.alt = "drone";
        img.style.width = "24px";
        img.style.height = "24px";
        img.style.transform = `rotate(${drone.properties.yaw || 0}deg)`; // Yaw rotation
        el.appendChild(img);

        marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="display:flex; flex-direction:column;">
            <h2>${drone.properties.Name}</h2>
            <div style="display:flex; flex-direction:row;gap:20px;">
              <div style="display:flex;flex-direction:column;">
                <span>Altitude</span><span>${drone.properties.altitude}m</span>
              </div>
              <div style="display:flex;flex-direction:column;">
                <span>Flight Time</span><span>${flightTracker.getFlightTime(registration)}</span>
              </div>
            </div>
          </div>
        `);
        marker.setPopup(popup);
        markers.current[registration] = marker;
      } else {
        // Update existing marker position & rotation
        marker.setLngLat([lng, lat]);
        const img = marker.getElement().querySelector("img") as HTMLImageElement;
        if (img) img.style.transform = `rotate(${drone.properties.yaw || 0}deg)`;
      }
    });
  }, [drones]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default DroneMap;
