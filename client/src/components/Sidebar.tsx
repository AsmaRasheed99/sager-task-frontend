import React, { useState } from "react";
import { useDrone } from "../hooks/useDrone";
import type { DroneWithPath } from "../types/drone";
import map from "../assets/location-svgrepo-com-2.svg";
import dashboard from "../assets/dashboard-svgrepo-com-2.svg";
import drone from "../assets/drone.svg";
import "../styles/Sidebar.css"; 

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<string>("drones");
  const [isDroneListVisible, setIsDroneListVisible] = useState<boolean>(true);
  const { drones , selectedDrone, setSelectedDrone } = useDrone();

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getStatusColor = (drone: DroneWithPath) => {
    const regParts = drone.properties.registration.split("-") || [];
    const firstLetter = regParts[1]?.[0] || "";
    return firstLetter.toUpperCase() === "B" ? "#24ff00" : "#ff0000";
  };

  return (
    <div className="sidebar-container">
      <div className="navigation-sidebar">
        <div
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <img src={dashboard} alt="dashboard" className="nav-icon" />
          <span className="nav-label">
            DASHBOARD
          </span>
        </div>
        <div
          className={`nav-item ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <img src={map} alt="map" className="nav-icon" />
          <span className="nav-label">
            MAP
          </span>
        </div>

        {/* to open drone list sidebar */}
        {!isDroneListVisible && (
          <div className="toggle-drone-list">
            <button
              onClick={() => setIsDroneListVisible(true)}
              className="toggle-button"
              title="Show Drone List"
            >
              <img src={drone} style={{ width: "20px", height: "25px" }} alt="Show Drone List" />
            </button>
            <div className="toggle-label">
              DRONES
            </div>
          </div>
        )}
      </div>

      {/* Second Sidebar - Drone Flying Section */}
      <div className={`drone-list-sidebar ${isDroneListVisible ? "" : "hidden"}`}>
        {isDroneListVisible && (
          <>
            <div className="drone-list-header">
              <button
                onClick={() => setIsDroneListVisible(false)}
                className="close-button"
              >
                ×
              </button>

              <div className="header-title">
                <div className="red-line"></div>
                <span className="title-text">
                  DRONE FLYING
                </span>
              </div>
              
              <div className="subtab-buttons">
                <button 
                  className={`subtab-button ${activeSubTab === "drones" ? "active" : ""}`}
                  onClick={() => setActiveSubTab("drones")}
                >
                  Drones
                </button>
                <button 
                  className={`subtab-button ${activeSubTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveSubTab("history")}
                >
                  Flights History
                </button>
              </div>
            </div>

            {/* Drones List */}
            <div className="drones-list hide-scrollbar">
              {activeSubTab === "drones" ? (
                drones.map((drone) => (
                  <div
                    key={drone.serial}
                    onClick={() => setSelectedDrone(drone.path)}
                    className={`drone-item ${selectedDrone === drone.path ? "selected" : ""}`}
                  >
                    <div className="drone-details">
                      <div className="drone-name">
                        {drone.properties.Name}
                      </div>

                      <div className="drone-info-grid">
                        <div>
                          <div>Serial #</div>
                          <div>{drone.properties.serial}</div>
                        </div>
                        <div>
                          <div>Registration #</div>
                          <div>{drone.properties.registration}</div>
                        </div>
                        <div>
                          <div>Pilot:</div>
                          <div>{drone.properties.pilot}</div>
                        </div>
                        <div>
                          <div>Organization:</div>
                          <div>{drone.properties.organization}</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="status-circle"
                      style={{ background: getStatusColor(drone) }}
                    ></div>
                  </div>
                ))
              ) : (
                <div className="no-history">
                  <div>Flights History</div>
                  <div>No flight history available</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;