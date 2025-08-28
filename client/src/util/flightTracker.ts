import type { FlightTracker } from "../types/drone";

// flight time tracker
export const flightTracker: FlightTracker = {
  activeDrones: new Map<string, Date>(),
  
  startFlight(registration: string) {
    if (!this.activeDrones.has(registration)) {
      this.activeDrones.set(registration, new Date());
    }
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