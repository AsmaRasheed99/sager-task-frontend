import { useContext } from "react";
import DroneContext from "../contexts/DroneContext";

export const useDrone = () => {
  const ctx = useContext(DroneContext);
  if (!ctx) throw new Error("useDrone must be used inside DroneProvider");
  return ctx;
};
