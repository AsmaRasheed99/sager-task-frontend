export interface DroneFeature {
    type: "Feature";
    properties:{
        serial: string;
        registration: string;
        Name: string;
        altitude: number;
        pilot: string;
        organization: string;
        yaw: number;
    };
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
}

export interface DroneData {
    type : "FeatureCollection";
    features: DroneFeature[];
}

// Extended type used in context for path history 
export interface DroneWithPath {
  serial: string;
  properties: DroneFeature["properties"];
  path: [number, number][]; // array of the history [lng, lat]
}

export interface FlightTracker {
  activeDrones: Map<string, Date>;
  startFlight: (registration: string) => void;
  stopFlight: (registration: string) => void;
  getFlightTime: (registration: string) => string;
  getActiveDrones: () => string[];
}
