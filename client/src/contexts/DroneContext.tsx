import React, {
  createContext,
  useEffect,
  useState,
} from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import type { DroneData, DroneWithPath } from "../types/drone";

interface DuplicateDrones {
    registrationDuplicates: { [key: string]: DroneWithPath[] }
}
interface DroneContextType {
  drones: DroneWithPath[];
  duplicates: DuplicateDrones;
}

const DroneContext = createContext<DroneContextType | undefined>(undefined);

function findDuplicateDronesByRegistration(
    drones: DroneWithPath[]
): DuplicateDrones {
    const registrationMap: {[key: string]: DroneWithPath[]} = {};

    // group drones by registration number
    drones.forEach((drone)=>{
        const registration = drone.properties.registration;
        if (!registrationMap[registration]){
            registrationMap[registration] = [];
        }
        registrationMap[registration].push(drone);
    })

    const registrationDuplicates: {[key:string]:DroneWithPath[]} = {};
    Object.keys(registrationMap).forEach((registration)=>{
        if(registrationMap[registration].length > 1){
            registrationDuplicates[registration] = registrationMap[registration];
        }
    });
    return { registrationDuplicates };
}

export const DroneProvider: React.FC<{children:React.ReactNode}> = ({
    children,
}) =>{
    const [drones, setDrones] = useState<DroneWithPath[]>([]);
    console.log(drones);

    const duplicates = findDuplicateDronesByRegistration(drones);

    useEffect(()=>{
        const socket = connectSocket();

        socket.on("message", (newData: DroneData)=>{
            setDrones((prev => {
                const updated = [...prev];

                newData.features.forEach(feature => {
                    const {serial , registration} = feature.properties;
                    const [lng, lat] = feature.geometry.coordinates;

                    // find drones by registration number
                    const index = updated.findIndex(d=>d.properties.registration === registration);
                    if (index !== -1){
                        // drone with thos registration exists 
                        const drone = updated[index];
                        const last = drone.path[drone.path.length -1];

                        // add new coordinates if it changed
                        if (!last || last[0] !== lng || last[1] !== lat){
                            drone.path.push([lng,lat]);
                        }
                        // update drone properties
                        drone.properties = feature.properties;
                        updated[index] = {...drone};
                    } else {
                        // new drone 
                        updated.push({
                            serial,
                            properties: feature.properties,
                            path: [[lng, lat]]
                        });
                    }
                });
                return updated;
            }))
        });

        return () => {
            socket.off("message");
            disconnectSocket();
        };
    },[]);

    return (
      <DroneContext.Provider value={{ drones, duplicates }}>
        {children}
      </DroneContext.Provider>
    );
}

export default DroneContext;
