import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { DroneProvider } from './contexts/DroneContext';


createRoot(document.getElementById('root')!).render(
<React.StrictMode>
    <DroneProvider>
      <App />
    </DroneProvider>
</React.StrictMode>
);