# 🚁 Drone Tracing System

A real-time drone tracing system built with **ReactJS** and **Mapbox**, communicating with a backend over **WebSocket**.  
This app visualizes live drones in the sky, classifies them based on their registration number, and provides a responsive dashboard interface.  

🔗 **Live Demo:** [sager-task-frontend.vercel.app](https://sager-task-frontend.vercel.app/)

---

## 🛠️ Tech Stack
- **Frontend:** ReactJS (Vite + TypeScript)
- **Map:** Mapbox GL JS
- **State Management:** React Context
- **Real-time Data:** socket io
- **Deployment:** Vercel

---

## 📂 Project Structure
```bash
src/
├── assets/             # Icons and images
├── components/         # Reusable UI components (Map, Sidebar, Dashboard, etc.)
├── hooks/              # Custom React hooks (e.g., useDrone, useMap)
├── styles/             # CSS files
├── types/              # TypeScript type definitions
├── services/           # Connections made (e.g., socket.ts)
├── utils/              # utility functions (e.g., flightTracker.ts , mapUtils.ts)
├── App.tsx             # Main application
└── main.tsx            # Entry point
