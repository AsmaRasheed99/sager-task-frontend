import { useState, useRef, useEffect } from 'react';
import './styles/App.css';
import Dashboard from './components/Dashboard';
import DroneMap from './components/DroneMap';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  const [activeTab, setActiveTab] = useState('map'); 
  const [mapKey, setMapKey] = useState(0); 
  const prevTabRef = useRef('map');

  useEffect(() => {
    const prevTab = prevTabRef.current;
    
    if (activeTab === 'map' && prevTab !== 'map') {
      setMapKey(prev => prev + 1);
    }
    
    prevTabRef.current = activeTab;
  }, [activeTab]);

  const handleTabChange = (newTab : string) => {
    setActiveTab(newTab);
  };

  return (
    <div className="app-container">
      <Header />

      <div className="main-content">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange}
        />

        <div className="content-area">
          {activeTab === 'dashboard' && (
            <div className="dashboard-wrapper" key="dashboard-wrapper">
              <Dashboard />
            </div>
          )}
          
          {activeTab === 'map' && (
            <div 
              className="map-wrapper"
              key={`map-wrapper-${mapKey}`}
            >
              <DroneMap key={`drone-map-${mapKey}`} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;